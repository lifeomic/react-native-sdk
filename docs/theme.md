# How to Customize the Theme

The components in this library come with a default set of colors and spacing.
You can customize these properties (and add your own) by injecting a `Theme`
object into the `BrandConfigProvider`.

```TSX
// App.tsx

import { Theme, BrandConfigProvider } from '@lifeomic/react-native-sdk'

const theme = new Theme({
  colors: {
    text: '#222222',
    background: '#FFFFFF',
  },
  spacing: {
    small: 10,
    large: 28,
  }
})

function App() {
  return (
    <BrandConfigProvider theme={theme}>
      // ...
    </BrandConfigProvider>
  )
}
```

You can also gain access to the default theme merged with your custom theme
through the `useTheme` hook.

```TSX
// MyComponent.tsx

import { useTheme } from '@lifeomic/react-native-sdk'

function MyComponent() {
  const { theme } = useTheme()

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      // ...
    </View>
  )
}
```
