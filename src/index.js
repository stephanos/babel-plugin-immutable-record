/* eslint no-param-reassign:0 no-restricted-syntax:0 */

const DECORATOR_DEFAULT_NAME = 'Record';

const INIT_PARAMETER_NAME = 'init';
const INIT_PARAMETER_TYPE_SUFFIX = 'Init';

const INTERNAL_DATA_NAME = 'data';
const TO_MAP_METHOD_NAME = 'toMap';

const SUPER_CLASS_NAME = 'Base';

const UPDATE_METHOD_NAME = 'update';
const UPDATE_PARAMETER_NAME = 'update';
const UPDATE_PARAMETER_TYPE_SUFFIX = 'Update';


function internalMapType(t) {
  return t.genericTypeAnnotation(
    t.identifier('Map'),
    t.typeParameterInstantiation([
      t.stringTypeAnnotation(),
      t.anyTypeAnnotation(),
    ])
  );
}

function findDecorator(classPath, name) {
  let ret;
  classPath.traverse({
    Decorator(decoratorPath) {
      if (decoratorPath.node.expression.callee.name === name) {
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

// function isPrimitiveType(t, typeAnnotation) {
//   const innerType = getInnerType(typeAnnotation);
//   return t.isBooleanTypeAnnotation(innerType)
//     || t.isBooleanLiteralTypeAnnotation(innerType)
//     || t.isNumberTypeAnnotation(innerType)
//     || t.isNumericLiteralTypeAnnotation(innerType)
//     || t.isStringTypeAnnotation(innerType)
//     || t.isStringLiteralTypeAnnotation(innerType);
// }

function setSuperClass(classPath, superClassNode) {
  const superClass = classPath.node.superClass;
  if (superClass) {
    throw classPath.buildCodeFrameError('no super class allowed');
  }
  classPath.node.superClass = superClassNode;
}


function createImportForImmutableMap(t, includeList) {
  const importsFromImmutable = [t.importSpecifier(t.identifier('Map'), t.identifier('Map'))];
  if (includeList) {
    importsFromImmutable.unshift(t.importSpecifier(t.identifier('List'), t.identifier('List')));
  }
  return t.importDeclaration(importsFromImmutable, t.stringLiteral('immutable'));
}

function createToMapMethod(t) {
  const result = t.classMethod('method', t.identifier(TO_MAP_METHOD_NAME), [],
    t.blockStatement([
      t.returnStatement(
        t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME))
        // t.callExpression(
        //   t.identifier('Map'), [
        //     t.objectExpression(properties.map((prop) => {
        //       const propRef = t.memberExpression(t.thisExpression(), t.identifier(`__${prop.key.name}`));
        //       const mapVal =
        //         isPrimitiveType(t, prop.typeAnnotation)
        //           ? propRef
        //           : t.conditionalExpression(
        //             t.binaryExpression('instanceof', propRef, superClassNode),
        //             t.callExpression(t.memberExpression(propRef, t.identifier(TO_MAP_METHOD_NAME)), []),
        //             propRef
        //           );
        //       return t.objectProperty(t.identifier(prop.key.name), mapVal);
        //     })),
        //   ]
        // )
      ),
    ])
  );
  result.returnType = t.typeAnnotation(internalMapType(t));
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

function checkThereIsNoMemberNamed(classPath, name) {
  const membersWithName =
    classPath.node.body.body.filter((member) => member.key.name === name);

  if (membersWithName.length !== 0) {
    throw classPath.buildCodeFrameError(`no class member with name '${name}' allowed`);
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
  });
}

function createUpdateMethod(t, inputTypeName, outputTypeName) {
  const parameter = t.identifier(UPDATE_PARAMETER_NAME);
  parameter.typeAnnotation = t.typeAnnotation(t.genericTypeAnnotation(t.identifier(inputTypeName)));

  const result = t.classMethod('method', t.identifier(UPDATE_METHOD_NAME),
    [parameter],
    t.blockStatement([
      t.returnStatement(
        t.newExpression(
          t.identifier(outputTypeName), [
            t.callExpression(
              t.memberExpression(
                t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME)),
                t.identifier('merge')
              ), [t.identifier(UPDATE_PARAMETER_NAME)]
            ),
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
  param.typeAnnotation = t.typeAnnotation(
    t.unionTypeAnnotation([
      t.genericTypeAnnotation(t.identifier(inputTypeName)),
      internalMapType(t),
    ])
  );

  return t.classMethod('constructor', t.identifier('constructor'), [param],
    t.blockStatement([
      t.expressionStatement(t.callExpression(t.super(), [])),
      t.ifStatement(
        t.callExpression(
          t.memberExpression(t.identifier('Map'), t.identifier('isMap')),
          [t.identifier(INIT_PARAMETER_NAME)]),
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression('=',
              t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME)),
              t.identifier(INIT_PARAMETER_NAME)
            )
          ),
        ]),
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression('=',
              t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME)),
              t.callExpression(t.identifier('Map'), [
                t.objectExpression(properties.map((prop) => {
                  let initValue = t.memberExpression(
                    t.identifier(INIT_PARAMETER_NAME), t.identifier(prop.key.name)
                  );
                  if (prop.value) {
                    initValue = t.logicalExpression('||', initValue, prop.value);
                  }
                  if (t.isArrayTypeAnnotation(getInnerType(prop.typeAnnotation))) {
                    initValue = t.callExpression(t.identifier('List'), [initValue]);
                  }
                  return t.objectProperty(t.identifier(prop.key.name), initValue);
                })),
              ])
            )
          ),
        ])
      ),
    ])
  );
}

function createGetters(t, properties) {
  return properties.map((prop) => {
    const getter = t.classMethod('get', t.identifier(prop.key.name), [],
      t.blockStatement([
        t.returnStatement(
          t.callExpression(
            t.memberExpression(
              t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME)),
              t.identifier('get')
            ),
            [t.stringLiteral(prop.key.name)]
          )
        ),
      ]));

    let returnType = prop.typeAnnotation;
    if (t.isArrayTypeAnnotation(getInnerType(returnType))) {
      returnType = t.typeAnnotation(
        t.genericTypeAnnotation(
          t.identifier('List'),
          t.typeParameterInstantiation([returnType.typeAnnotation.elementType])
        )
      );
    }
    getter.returnType = returnType;

    return getter;
  });
}

function makeImmutable(t, classPath, opts) {
  const decoratorName = opts.decoratorName || DECORATOR_DEFAULT_NAME;

  const decoratorPath = findDecorator(classPath, decoratorName);
  if (decoratorPath === undefined) {
    return;
  }
  decoratorPath.addComment('leading', '::`');
  decoratorPath.addComment('trailing', '::`;');

  const classBody = classPath.node.body.body;
  const className = classPath.node.id.name;

  const superClassNode = t.memberExpression(
    t.identifier(decoratorName), t.identifier(SUPER_CLASS_NAME));
  setSuperClass(classPath, superClassNode);

  const properties = classBody.filter((member) => member.type === 'ClassProperty');
  checkThereIsNoMemberNamed(classPath, INTERNAL_DATA_NAME);
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

  checkThereIsNoMemberNamed(classPath, UPDATE_METHOD_NAME);
  const updateDataType = className + UPDATE_PARAMETER_TYPE_SUFFIX;
  classBody.push(
    createUpdateMethod(t, updateDataType, className)
  );
  classPath.insertAfter(
    createUpdateDataType(t, updateDataType, properties)
  );

  checkThereIsNoMemberNamed(classPath, TO_MAP_METHOD_NAME);
  classBody.push(
    createToMapMethod(t, properties, superClassNode)
  );

  let hasDecoratorImport = false;
  const fileBody = classPath.parentPath.node.body;
  for (const i in fileBody) {
    if (t.isImportDeclaration(fileBody[i])) {
      const hasArrayType = classBody.filter((member) => getInnerType(member.typeAnnotation)).length > 0;
      fileBody.splice(i + 1, 0, createImportForImmutableMap(t, hasArrayType));
      hasDecoratorImport = true;
      break;
    }
  }
  if (!hasDecoratorImport) {
    throw decoratorPath.buildCodeFrameError(
      `file is missing the import for the '${decoratorName}' decorator`);
  }

  classPath.node.body.body = classBody.filter((member) => member.type !== 'ClassProperty');
  classPath.node.body.body.unshift(t.classProperty(
    t.identifier(INTERNAL_DATA_NAME), null, t.typeAnnotation(internalMapType(t))
  ));
}


export default function ({ types: t }) {
  return {
    visitor: {
      ClassDeclaration(path, state) {
        makeImmutable(t, path, state.opts);
      },
    },
  };
}
