import esbuild, { TransformOptions  } from 'esbuild';

type options = TransformOptions


async function bundleTypeScript() {
  try {
    const result = await esbuild.build({
      entryPoints: ['src/main.ts'], // Entry point of your TypeScript code
      bundle: true, // Enable bundling
      write: false, // Prevent writing to disk
      platform: 'browser', // or 'browser', depending on your target
      format: 'esm', // Output format (e.g., 'cjs' for CommonJS, 'esm' for ES Modules)
      outdir: 'out', // Specify an output directory (required even if write: false)
      metafile: true, // Enable metadata generation to capture output details
    });

    // The bundled code is in result.outputFiles[0].text
    const bundledCode = result.outputFiles[0].text;

    console.log('Bundled code:', bundledCode);

    // You can now manipulate bundledCode as needed
    return bundledCode;
  } catch (error) {
    console.error('Bundling error:', error);
    return null;
  }
}