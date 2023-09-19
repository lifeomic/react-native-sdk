import { Linking } from 'react-native';

export const enforceWebURLProtocol = (url: string) => {
  const allowedProtocols = ['https://', 'http://', 'mailto:'];
  const startsWithAllowedProtocol = allowedProtocols.some((protocol) =>
    url.startsWith(protocol),
  );
  return startsWithAllowedProtocol ? url : allowedProtocols[0].concat(url);
};

export const openURL = async (url: string) => {
  const formattedURL = enforceWebURLProtocol(url);
  await Linking.openURL(formattedURL);
};
