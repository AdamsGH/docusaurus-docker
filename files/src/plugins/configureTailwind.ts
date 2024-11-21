// configureTailwind.ts
export interface PluginOptions {
  plugins: string[];
}

function configureTailwind({ plugins }: PluginOptions) {
  return function() {
    return {
      name: "docusaurus-tailwindcss",
      configurePostCss(postcssOptions) {
        console.log('Configuring PostCSS with plugins:', plugins);
        plugins.forEach(plugin => {
          console.log('Requiring plugin:', plugin);
          const requiredPlugin = require(plugin);
          console.log('Required plugin:', requiredPlugin);
          postcssOptions.plugins.push(requiredPlugin);
        });
        return postcssOptions;
      },
    };
  }
}

export default configureTailwind;