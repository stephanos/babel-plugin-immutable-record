/* eslint no-param-reassign:0 no-restricted-syntax:0 */

const DATA_DECORATOR = 'Data';

const INIT_PARAMETER_NAME = 'init';
const INIT_PARAMETER_TYPE_SUFFIX = 'Init';

const TO_MAP_METHOD_NAME = 'toMap';

const SUPER_CLASS_NAME = 'Base';

const UPDATE_METHOD_NAME = 'update';
const UPDATE_PARAMETER_NAME = 'update';
const UPDATE_PARAMETER_TYPE_SUFFIX = 'Update';


function findDecorator(classPath) {
  let ret;
  classPath.traverse({
    Decorator(decoratorPath) {
      if (decoratorPath.node.expression.callee.name === DATA_DECORATOR) {
        ret = decoratorPath;
      }
    },
  });
  return ret;
}

function getInnerType(typeAnnotation) {
  let innerType = typeAnnotation;
  while (innerType && innerType.typeAnnotation) {
    innerType = innerType.typeAnnotation;
  }
  return innerType;
}

function isPrimitiveType(t, typeAnnotation) {
  const innerType = getInnerType(typeAnnotation);
  return t.isBooleanTypeAnnotation(innerType)
    || t.isBooleanLiteralTypeAnnotation(innerType)
    || t.isNumberTypeAnnotation(innerType)
    || t.isNumericLiteralTypeAnnotation(innerType)
    || t.isStringTypeAnnotation(innerType)
    || t.isStringLiteralTypeAnnotation(innerType);
}

function setSuperClass(classPath, superClassNode) {
  const superClass = classPath.node.superClass;
  if (superClass) {
    throw classPath.buildCodeFrameError('no super class allowed');
  }
  classPath.node.superClass = superClassNode;
}


function createImportForImmutableMap(t) {
  return t.importDeclaration([
    t.importSpecifier(t.identifier('Map'), t.identifier('Map')),
  ], t.stringLiteral('immutable'));
}

function createToMapMethod(t, properties, superClassNode) {
  const result = t.classMethod('method', t.identifier(TO_MAP_METHOD_NAME), [],
    t.blockStatement([
      t.returnStatement(
        t.callExpression(
          t.identifier('Map'), [
            t.objectExpression(properties.map((prop) => {
              const propRef = t.memberExpression(t.thisExpression(), t.identifier(`__${prop.key.name}`));
              const mapVal =
                isPrimitiveType(t, prop.typeAnnotation)
                  ? propRef
                  : t.conditionalExpression(
                    t.binaryExpression('instanceof', propRef, superClassNode),
                    t.callExpression(t.memberExpression(propRef, t.identifier(TO_MAP_METHOD_NAME)), []),
                    propRef
                  );
              return t.objectProperty(t.identifier(prop.key.name), mapVal);
            })),
          ]
        )
      ),
    ])
  );
  result.returnType = t.typeAnnotation(
    t.genericTypeAnnotation(
      t.identifier('Map'),
      t.typeParameterInstantiation([
        t.stringTypeAnnotation(),
        t.anyTypeAnnotation(),
      ])
    )
  );
  return result;
}

function createUpdateDataType(t, name, properties) {
  return t.typeAlias(
    t.identifier(name), null,
    t.objectTypeAnnotation(properties.map((prop) => {
      const type = prop.typeAnnotation.typeAnnotation;
      const typeProp = t.objectTypeProperty(t.identifier(prop.key.name), type);
      typeProp.optional = true;
      return typeProp;
    }), [
      t.objectTypeIndexer(
        t.identifier('key'), t.stringTypeAnnotation(), t.voidTypeAnnotation()
      ),
    ])
  );
}

function createInitDataType(t, name, properties) {
  return t.typeAlias(t.identifier(name), null,
    t.objectTypeAnnotation(properties.map((prop) => {
      const propType = prop.typeAnnotation.typeAnnotation;
      const typeProp = t.objectTypeProperty(t.identifier(prop.key.name), propType);
      if (prop.value) {
        typeProp.optional = true;
      }
      return typeProp;
    }), [
      t.objectTypeIndexer(
        t.identifier('key'), t.stringTypeAnnotation(), t.voidTypeAnnotation()
      ),
    ])
  );
}

function checkThereIsNoToMapMember(classPath) {
  const toMapMembers =
    classPath.node.body.body.filter((member) => member.key.name === TO_MAP_METHOD_NAME);

  if (toMapMembers.length !== 0) {
    throw classPath.buildCodeFrameError(
      `no class member with name '${TO_MAP_METHOD_NAME}' allowed`);
  }
}

function checkThereIsNoUpdateMember(classPath) {
  const updateMembers =
    classPath.node.body.body.filter((member) => member.key.name === UPDATE_METHOD_NAME);

  if (updateMembers.length !== 0) {
    throw classPath.buildCodeFrameError(
      `no class member with name '${UPDATE_METHOD_NAME}' allowed`);
  }
}

function checkPropertyNames(classPath, properties) {
  properties.forEach((prop) => {
    const propName = prop.key.name;
    if (!/^[a-zA-Z]/.test(propName)) {
      throw classPath.buildCodeFrameError(
        `invalid property '${propName}': must start with character`);
    }
  });
}

function checkPropertyTypes(t, classPath, properties) {
  properties.forEach((prop) => {
    const innerType = getInnerType(prop.typeAnnotation);
    if (innerType === null || innerType === undefined) {
      throw classPath.buildCodeFrameError(
        `invalid property '${prop.key.name}': missing type`);
    }
    if (t.isVoidTypeAnnotation(innerType)) {
      throw classPath.buildCodeFrameError(
        `invalid property '${prop.key.name}': type 'void' is not allowed`);
    }
    if (t.isFunctionTypeAnnotation(innerType)) {
      throw classPath.buildCodeFrameError(
        `invalid property '${prop.key.name}': type 'Function' is not allowed`);
    }
    if (t.isObjectTypeAnnotation(innerType)) {
      throw classPath.buildCodeFrameError(
        `invalid property '${prop.key.name}': type 'Object' is not allowed`);
    }
    if (t.isArrayTypeAnnotation(innerType)) {
      throw classPath.buildCodeFrameError(
        `invalid property '${prop.key.name}': type 'Array' is not allowed`);
    }
  });
}

function createUpdateMethod(t, inputTypeName, outputTypeName, properties) {
  const parameter = t.identifier(UPDATE_PARAMETER_NAME);
  parameter.typeAnnotation = t.typeAnnotation(t.genericTypeAnnotation(t.identifier(inputTypeName)));

  const result = t.classMethod('method', t.identifier(UPDATE_METHOD_NAME),
    [parameter],
    t.blockStatement([
      t.returnStatement(
        t.newExpression(
          t.identifier(outputTypeName), [
            t.objectExpression(properties.map((prop) =>
              t.objectProperty(
                t.identifier(prop.key.name),
                t.logicalExpression('||',
                  t.memberExpression(t.identifier(UPDATE_PARAMETER_NAME), t.identifier(prop.key.name)),
                  t.memberExpression(t.thisExpression(), t.identifier(`__${prop.key.name}`))
                )
              )
            )),
          ]
        )
      ),
    ])
  );
  result.returnType = t.typeAnnotation(t.genericTypeAnnotation(t.identifier(outputTypeName)));
  return result;
}

function checkThereIsNoConstructor(classPath) {
  const constructor = classPath.node.body.body.filter((member) => member.kind === 'constructor');
  if (constructor.length > 0) {
    throw classPath.buildCodeFrameError('a constructor is not allowed');
  }
}

function createConstructor(t, inputTypeName, properties) {
  const param = t.identifier(INIT_PARAMETER_NAME);
  param.typeAnnotation = t.typeAnnotation(t.genericTypeAnnotation(t.identifier(inputTypeName)));

  return t.classMethod('constructor', t.identifier('constructor'), [param],
    t.blockStatement(
      [t.expressionStatement(t.callExpression(t.super(), []))].concat(
        properties.map((prop) => {
          const initProp = t.memberExpression(t.identifier(INIT_PARAMETER_NAME), t.identifier(prop.key.name));
          return t.expressionStatement(
            t.assignmentExpression('=',
              t.memberExpression(t.thisExpression(), t.identifier(`__${prop.key.name}`)),
              prop.value ? t.logicalExpression('||', initProp, prop.value) : initProp
            )
          );
        })
      )
    )
  );
}

function createGetters(t, properties) {
  return properties.map((prop) => {
    const getter = t.classMethod('get', t.identifier(prop.key.name), [],
      t.blockStatement([
        t.returnStatement(
          t.memberExpression(t.thisExpression(), t.identifier(`__${prop.key.name}`))
        ),
      ]));
    getter.returnType = prop.typeAnnotation;
    return getter;
  });
}

function makeImmutable(t, classPath) {
  const decoratorPath = findDecorator(classPath);
  if (decoratorPath === undefined) {
    return;
  }
  decoratorPath.addComment('leading', '::`');
  decoratorPath.addComment('trailing', '::`;');

  const classBody = classPath.node.body.body;
  const className = classPath.node.id.name;

  const superClassNode = t.memberExpression(
    t.identifier(DATA_DECORATOR), t.identifier(SUPER_CLASS_NAME));
  setSuperClass(classPath, superClassNode);

  const properties = classBody.filter((member) => member.type === 'ClassProperty');
  checkPropertyNames(classPath, properties);
  checkPropertyTypes(t, classPath, properties);
  createGetters(t, properties).forEach((getter) => classBody.push(getter));

  checkThereIsNoConstructor(classPath);
  const initDataType = className + INIT_PARAMETER_TYPE_SUFFIX;
  classBody.unshift(
    createConstructor(t, initDataType, properties)
  );
  classPath.insertAfter(
    createInitDataType(t, initDataType, properties)
  );

  checkThereIsNoUpdateMember(classPath);
  const updateDataType = className + UPDATE_PARAMETER_TYPE_SUFFIX;
  classBody.push(
    createUpdateMethod(t, updateDataType, className, properties)
  );
  classPath.insertAfter(
    createUpdateDataType(t, updateDataType, properties)
  );

  checkThereIsNoToMapMember(classPath);
  classBody.push(
    createToMapMethod(t, properties, superClassNode)
  );

  properties.forEach((prop) => {
    prop.key.name = `__${prop.key.name}`;
    prop.value = null;
  });

  // TODO: check an import for the decorator is there
  const fileBody = classPath.parentPath.node.body;
  for (const i in fileBody) {
    if (t.isImportDeclaration(fileBody[i])) {
      fileBody.splice(i + 1, 0, createImportForImmutableMap(t));
      break;
    }
  }
}


export default function ({ types: t }) {
  return {
    visitor: {
      ClassDeclaration(path) {
        makeImmutable(t, path);
      },
    },
  };
}
