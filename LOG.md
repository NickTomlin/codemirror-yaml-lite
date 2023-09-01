# Multiline / plain issues

Multiline works here:
```yaml
foo: bar
fiz: "boo"
hi: |
  there
```

but not if we don't quote "boo"

```yaml
foo: bar
fiz: boo
hi: |
  there
```

seems like there's an issue detecting `FoldOp` and `Value`