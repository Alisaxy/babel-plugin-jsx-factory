module.exports = function (babel, opts) {
  if (!opts) opts = {};
  var t = babel.types;
  return new babel.Transformer('jsx-factory', {
    JSXElement: function transform (node) {
      if (/^[A-Z]/.test(node.openingElement.name.name)) {
        return t.callExpression(
          t.identifier(node.openingElement.name.name),
          [
            t.objectExpression(node.openingElement.attributes)
          ]
        );
      }
      var attrs = node.openingElement.attributes;
      var tagName = node.openingElement.name.name;
      var index = 0;
      var classes = attrs.find(function (item, idx) {
        var name = (item || {}).name;
        index = idx;
        return name && name.name === "class" });
      if(classes) {
        classes = classes.value.value.replace(/\s+/g, ".");
        tagName += '.' + classes;
        attrs.splice(index, 1);
      }
      return t.callExpression(
        t.identifier('h'),
        [
          t.literal(tagName),
          t.objectExpression(attrs),
          t.arrayExpression(node.children.map(childf))
        ]
      );
      function childf (c) {
        if (c.type === 'JSXElement') {
          return transform(c);
        }
        else if (c.type === 'Literal') {
          return t.literal(c.value); // for some reason necessary
        }
        else return c;
      }
    }
  });
};
