const assetModules = import.meta.glob("./*", {
  eager: true,
  import: "default",
  query: "?url",
});

const assetImages = Object.fromEntries(
  Object.entries(assetModules).map(([path, url]) => [path.split("/").pop(), url])
);

export const assetNames = Object.keys(assetImages)
  .filter((name) => !name.endsWith(".js"))
  .sort((firstName, secondName) => firstName.localeCompare(secondName));

export const resolveAssetImage = (image) => assetImages[image] || image;
