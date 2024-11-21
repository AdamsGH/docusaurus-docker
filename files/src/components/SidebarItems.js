import { useCurrentSidebarCategory } from '@docusaurus/theme-common'; // adjust the import path if needed

export default function SidebarItems({ excludeIndex, excludeFiles = [] }) {
  const { items } = useCurrentSidebarCategory();

  return items.map(item => {
    if (item.href) {
      const pathParts = item.href.split('/');
      const filename = pathParts.pop();
      const rootPath = pathParts.join('/');

      if ((excludeIndex && filename === '') || excludeFiles.includes(filename)) {
        return { ...item, unlisted: true };
      }
    }
    return item;
  });
}