import React from 'react';
import Svg, { Path } from 'react-native-svg';

const Google = () => {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.393 12.784c0-.638-.058-1.252-.167-1.84h-8.67v3.48h4.954c-.213 1.126-.862 2.079-1.837 2.717V19.4h2.975c1.741-1.567 2.745-3.874 2.745-6.615z"
        fill="#4285F4"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.555 21.58c2.486 0 4.57-.806 6.093-2.18l-2.975-2.259c-.825.54-1.879.86-3.118.86-2.397 0-4.427-1.584-5.15-3.711H4.328v2.332c1.514 2.941 4.628 4.958 8.226 4.958z"
        fill="#34A853"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.404 14.29a5.3 5.3 0 01-.288-1.71 5.3 5.3 0 01.288-1.71V8.538H4.33a8.833 8.833 0 000 8.084l3.075-2.332z"
        fill="#FBBC05"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.555 7.16c1.352 0 2.566.454 3.52 1.346l2.64-2.582c-1.594-1.452-3.678-2.344-6.16-2.344-3.598 0-6.712 2.017-8.226 4.958l3.075 2.332c.724-2.127 2.754-3.71 5.151-3.71z"
        fill="#EA4335"
      />
    </Svg>
  );
};

export default Google;
