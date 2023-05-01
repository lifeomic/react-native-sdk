/**
 * Currently mocking instead of testing until this is fixed:
 * https://github.com/material-foundation/material-color-utilities/issues/35
 *
 * Google promises next release.
 */

export const argbFromHex = jest.fn().mockReturnValue({});

export const themeFromSourceColor = jest.fn().mockReturnValue({
  palettes: { neutralVariant: { tone: jest.fn() } },
  schemes: {
    light: {
      toJSON: jest.fn().mockReturnValue({}),
    },
  },
});
