import { boot } from 'quasar/wrappers';
import VueBlocksTree from 'vue3-blocks-tree';
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';

const defaultOptions = { nodeName: 'blocks-tree', treeName: 'blocks-tree' };

export default boot(async ({ app }) => {
  app.use(VueBlocksTree, [defaultOptions])
});
