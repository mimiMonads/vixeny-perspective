import type * as ejsModule from "ejs";
import type * as Vixeny from "vixeny";
import type { plugingType } from "../../type";

type Petition = ReturnType<ReturnType<typeof Vixeny.petitions.common>>;

type StaticServer = {
  preserveExtension?: boolean;
  f: Petition;
};

const renderFileEJS = ( args : {
  renderFile: typeof ejsModule.renderFile,
  plugins: plugingType
}) => {
 const { renderFile , plugins} = args

 const symbol = Symbol('renderFileEJS')

 return plugins.type({
  name: symbol,
  isFunction: true,
  isAsync: true,
  type: {} as ejsModule.Options,
  f: async (ctx) => {

    const name = ctx.currentName(symbol)
    const petition = ctx.getPetition()
    const path = petition.path.endsWith('.ejs')
      ? petition.path
      :  petition.path + '.ejs'

    const options = ctx.getOptionsFromPetition<ejsModule.Options>(
      petition
    )(name) ?? {}

    return    async (data: ejsModule.Data) =>  await renderFile(path,data,options)
  }
 })
};

const defaultFileEJS = ( args : {
  renderFile: typeof ejsModule.renderFile,
  defaults?: ejsModule.Data,
  plugins: plugingType
}) => {
 const { renderFile , defaults , plugins} = args


 const symbol = Symbol('defaultFileEJS')

 return plugins.type({
  name: symbol,
  isFunction: false,
  isAsync: true,
  type: {} as ejsModule.Options,
  f: async (ctx) => {

    const name = ctx.currentName(symbol)
    const petition = ctx.getPetition()
    const path = petition.path.endsWith('.ejs')
      ? petition.path
      :  petition.path + '.ejs'

    const options = ctx.getOptionsFromPetition<ejsModule.Options>(
      petition
    )(name) ?? {}

    let res:(string | Promise<string>) = await renderFile(path,defaults,options)

     return async () =>  {


        return res 
     }
  }
 })
};


export const ejsStaticServePlugin =
    (petition: typeof Vixeny.petitions) =>
    (renderFile: typeof ejsModule.renderFile) =>
    (defaults?: ejsModule.Data) =>
    ( plugins: plugingType) =>
       {
      
      const defaultEJS = defaultFileEJS({
        renderFile,
        defaults,
        plugins
      })

      const renderEJS = renderFileEJS({
        renderFile,
        plugins
      })

      return petition.sealableAdd({
        cyclePlugin:{
          defaultEJS,
          renderEJS
        }
      })
    };




export const ejsStaticServerPlugin = (obj: {

  plugins: typeof Vixeny.plugins;
  options: StaticServer;
}) => {
  const {  plugins, options } = obj;

  return plugins.staticFilePlugin({
    type: "add",
    checker: (ctx) => ctx.path.includes(".ejs"),
    p: (ob) => 
      (
        {
          lazy: true,
          ...options.f,
          path: options && "preserveExtension" in options &&
              !options.preserveExtension
            ? ob.relativeName.slice(0, -4)
            : ob.relativeName,

        } 
      ),
  });
};
