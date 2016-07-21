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

function findImports(filePath) {
  const ret = [];
  filePath.traverse({
    ImportDeclaration(path) {
      ret.push(path);
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

function setSuperClass(classPath, superClassNode) {
  const superClass = classPath.node.superClass;
  if (superClass) {
    throw classPath.buildCodeFrameError('no super class allowed');
  }
  classPath.node.superClass = superClassNode;
}

function createImportForImmutableMap(t, existingImportPath, includeListType) {
  const toImport = new Set(['Iterable', 'Map']);

  if (existingImportPath) {
    existingImportPath.node.specifiers.forEach(s => toImport.add(s.imported.name));
  }

  if (includeListType) {
    toImport.add('List');
  }

  const specifiers = [];
  toImport.forEach(i => specifiers.push(t.importSpecifier(t.identifier(i), t.identifier(i))));
  specifiers.sort((x, y) => x.imported.name > y.imported.name);
  return t.importDeclaration(specifiers, t.stringLiteral('immutable'));
}

function createToMapFunction(t, superClassNode) {
  const parameterName = 'v';
  const result = t.functionDeclaration(
    t.identifier(TO_MAP_METHOD_NAME),
    [t.identifier(parameterName)],
    t.blockStatement([
      t.ifStatement(
        t.binaryExpression(
          'instanceof', t.identifier(parameterName), t.identifier('Iterable')
        ),
        t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.memberExpression(t.identifier(parameterName), t.identifier('map')),
              [t.identifier(TO_MAP_METHOD_NAME)]
            )
          ),
        ]),
        null
      ),
      t.ifStatement(
        t.binaryExpression(
          'instanceof', t.identifier(parameterName), superClassNode
        ),
        t.blockStatement([
          t.returnStatement(
            t.callExpression(
              t.memberExpression(t.identifier(parameterName), t.identifier(TO_MAP_METHOD_NAME)),
              []
            )
          ),
        ]),
        null
      ),
      t.returnStatement(t.identifier(parameterName)),
    ])
  );
  result.returnType = t.typeAnnotation(t.anyTypeAnnotation());
  return result;
}

function createToMapMethod(t) {
  const result = t.classMethod('method', t.identifier(TO_MAP_METHOD_NAME), [],
    t.blockStatement([
      t.returnStatement(
        t.callExpression(
          t.identifier(TO_MAP_METHOD_NAME),
          [t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME))]
        )
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

  const tmpVarName = 'updated';
  const result = t.classMethod('method', t.identifier(UPDATE_METHOD_NAME),
    [parameter],
    t.blockStatement([
      t.variableDeclaration('const',
        [t.variableDeclarator(t.identifier(tmpVarName),
          t.callExpression(
            t.memberExpression(t.identifier('Object'), t.identifier('create')),
            [t.memberExpression(t.identifier(outputTypeName), t.identifier('prototype'))]
          )
        )]
      ),
      t.expressionStatement(
        t.assignmentExpression('=',
          t.memberExpression(t.identifier(tmpVarName), t.identifier(INTERNAL_DATA_NAME)),
          t.callExpression(
            t.memberExpression(
              t.memberExpression(t.thisExpression(), t.identifier(INTERNAL_DATA_NAME)),
              t.identifier('merge')
            ), [
              t.callExpression(t.identifier('Map'), [t.identifier(UPDATE_PARAMETER_NAME)]),
            ]
          )
        )
      ),
      t.returnStatement(t.identifier(tmpVarName)),
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
    t.genericTypeAnnotation(t.identifier(inputTypeName))
  );

  return t.classMethod('constructor', t.identifier('constructor'), [param],
    t.blockStatement([
      t.expressionStatement(t.callExpression(t.super(), [])),
      t.ifStatement(
        t.identifier(INIT_PARAMETER_NAME),
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
  const decoratorName = opts.decorator || DECORATOR_DEFAULT_NAME;
  const decoratorPath = findDecorator(classPath, decoratorName);
  if (decoratorPath === undefined) {
    return;
  }

  const header = opts.header;
  if (header) {
    classPath.parent.leadingComments = [{
      type: 'CommentBlock',
      value: `\n${opts.header}\n`,
    }];
  }

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
  classPath.insertBefore(
    createToMapFunction(t, superClassNode)
  );
  classBody.push(
    createToMapMethod(t)
  );

  const imports = findImports(classPath.parentPath);
  const decoratorImport = imports.find(i => i.node.specifiers.find(s => s.local.name === decoratorName));
  if (!decoratorImport) {
    throw decoratorPath.buildCodeFrameError(
      `file is missing the import for the '${decoratorName}' decorator`);
  }

  const existingImmutableImportPath = imports.find(i => i.node.source.value === 'immutable');
  const hasArrayType = classBody.filter((member) => getInnerType(member.typeAnnotation)).length > 0;
  const immutableImport = createImportForImmutableMap(t, existingImmutableImportPath, hasArrayType);
  if (existingImmutableImportPath) {
    existingImmutableImportPath.replaceWith(immutableImport);
  } else {
    decoratorImport.insertAfter(immutableImport);
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
