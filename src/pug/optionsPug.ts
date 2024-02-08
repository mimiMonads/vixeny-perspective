import pugRenderer from './pugRender'

const pugOptions = {
    cyclePlugin: {
        // other plugins,
        pugRenderer: pugRenderer()
    }
};


export default pugOptions;