<script setup lang='ts'>
import { defineComponent, ref, reactive, computed } from 'vue';
import { api } from 'src/boot/axios';
import { fakeTreeData2 } from 'src/utils/dummyData'


let inputLeafId = ref();
let selected = ref([]);
let treeOrientation = ref('0');
let treeData = reactive({
  label: 'root',
  expand: true,
  some_id: 1,
  children: [
    { label: 'child 1', some_id: 2, },
    { label: 'child 2', some_id: 3, },
    {
      label: 'subparent 1',
      some_id: 4,
      expand: false,
      children: [
        { label: 'subchild 1', some_id: 5 },
        {
          label: 'subchild 2',
          some_id: 6,
          expand: false,
          children: [
            { label: 'subchild 11', some_id: 7 },
            { label: 'subchild 22', some_id: 8 },
          ]
        },
      ]
    },
  ]
});

const toggleSelect = (node, isSelected) => {
  isSelected ? selected.value.push(node.some_id) : selected.value.splice(selected.value.indexOf(node.some_id), 1);
  if (node.children && node.children.length) {
    node.children.forEach(ch => {
      toggleSelect(ch, isSelected)
    })
  }
}

const tryAddLeaf = (parentId, tree) => {

  let isParent = tree.some_id == parentId;
  if (isParent) {
    let some_id = parseInt(Math.random() * 100)
    let leaf = {
      label: `child of ${tree.label}`,
      some_id: some_id,
    }
    if (!tree.children) {
      tree.expand = true;
      tree.children = [];
    }

    tree.children.push(leaf);

  } else if (tree.children) {
    tree.children.forEach(ch => tryAddLeaf(parentId, ch))
  }
}

const deleteNode = (node, tree) => {

  let parent = tree.children ? tree.children.find(p => p.some_id == node.some_id) : null;
  if (parent) {
    tree.children.splice(tree.children.indexOf(node), 1)
  } else if (tree.children) {
    tree.children.forEach(ch => deleteNode(node, ch))
  }


}

const getData = async () => {
  const { data } = await api.get('/org-chart');
  console.log(data);
  fakeData.value = data.relationships;

  reRender()
}

const fakeData = ref(fakeTreeData2);


const treeConstructor = (target: object, items: object[], asRoot = false) => {
  if (asRoot) {
    target.children = items
      .filter((i) => i.reports_to_id === '')
      .map((child) => {
        return treeConstructor(child, items);
      });
  } else {
    target.children = items
      .filter((i) => i.reports_to_id === target.id)
      .map((child) => {
        return treeConstructor(child, items);
      });
  }


  return target;
};

const formattedValue = computed(() => {
  const contacts = fakeData.value.filter(val => val.type === 'Contact');
  console.log(contacts)
  const root = {
    ...fakeData.value.find(val => val.type === 'Account'),
    children: []
  }
  const tree = treeConstructor(root, contacts, true);
  return tree;

})

const fakeDelete = () => {
  fakeData.value = fakeData.value.filter(data => data.id !== '3483a23b-c5c3-541b-3068-58121c45318a');
  reRender();
}

// re-render
const fakeLoading = ref(false);
const reRender = () => {
  fakeLoading.value = true;

  setTimeout(() => {
    fakeLoading.value = false;
  }, 1000);
}
</script>

<template>
  <!-- <pre>{{ fakeData.length }}</pre>
  <pre>{{ formattedValue }}</pre> -->
  <q-btn color="primary" icon="check" label="Get data" @click="getData" />
  <q-btn color="warning" icon="check" label="deleteLast" @click="fakeDelete" />
  <div>Orientation</div>
  <select v-model="treeOrientation">
    <option value="0">Vertical</option>
    <option value="1">Horizontal</option>
  </select>

  <div>Basic</div>
  <div>
    <div v-if="fakeLoading">loading...</div>
    <blocks-tree v-else :props="{ label: 'label', expand: 'expand', children: 'children', key: 'some_id' }"
      :data="formattedValue" :horizontal="treeOrientation == '1'" :collapsable="true"></blocks-tree>
  </div>
  <div>With slots</div>
  <div>
    <blocks-tree :data="treeData" :props="{ label: 'label', expand: 'expand', children: 'children', key: 'some_id' }"
      :horizontal="treeOrientation == '1'" :collapsable="true">
      <template #node="{ data, context }">
        <span>
          <input type="checkbox" :checked="selected.indexOf(data.some_id) > -1"
            @change="(e) => toggleSelect(data, e.target.checked)" /> <strong>#{{ data.some_id }}</strong> {{ data.label }}
          &nbsp;
          <a v-if="data.some_id != treeData.some_id" title="Delete item" style="color:red;cursor:pointer;"
            @click="() => deleteNode(data, treeData)">x</a>
        </span>
        <br />
        <span v-if="data.children && data.children.length">
          <a href="#" @click="context.toggleExpand">toggle expand</a>
        </span>



      </template>
    </blocks-tree>
    <div>
      Selected: {{ selected }}
    </div>
    <div>
      <label for="add_leaf">Add leaf to item with id:</label>
      <input id="add_leaf" v-model="inputLeafId" type="number" /> <button
        @click="() => tryAddLeaf(inputLeafId, treeData)">+</button>

    </div>
  </div>
</template>

<style scoped lang='scss'></style>
