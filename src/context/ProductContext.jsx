import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { resolveAssetImage } from "../assets/assetImages";

export const ProductContext = createContext();

const normalizeProduct = (product) => ({
  ...product,
  image: resolveAssetImage(product.image),
});

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then((response) => setProducts(response.data.map(normalizeProduct))).catch(() => setProducts([]));
  }, []);

  const addProduct = async (product) => {
    const response = await api.post("/products", product);
    setProducts((currentProducts) => [normalizeProduct(response.data), ...currentProducts]);
  };

  const updateProduct = async (product) => {
    await api.put(`/products/${product.id}`, product);
    setProducts((currentProducts) => currentProducts.map((item) => (item.id === product.id ? normalizeProduct(product) : item)));
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    setProducts((currentProducts) => currentProducts.filter((item) => item.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);