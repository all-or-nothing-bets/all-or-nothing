const CracoAntDesignPlugin = require('craco-antd');

module.exports = {
  plugins: [
    {
      plugin: CracoAntDesignPlugin,
      options: {
        customizeTheme: {
          '@primary-color': '#1DA57A',
          '@link-color': '#1DA57A',
          '@border-radius-base': '15px',
          '@font-size-base': '16px',
          '@border-color-base': '#d9d9d9;',
        },
      },
    },
  ],
};
