const CracoAntDesignPlugin = require('craco-antd');
const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // noIeCompat: true,
          lessOptions: {
            modifyVars: {
              '@primary-color': '#1DA57A',
              '@link-color': '#1DA57A',
              '@border-radius-base': '2px',
              '@text-color': '#faad14',
              '@font-size-base': '40px',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#1DA57A',
          '@link-color': '#1DA57A',
          '@border-radius-base': '2px',
          '@text-color': '#faad14',
          '@font-size-base': '40px',
        },
      },
    },
  ],
};
