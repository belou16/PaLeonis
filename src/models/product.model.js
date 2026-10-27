class Product {
  #id;
  #name;
  #price;

  static #data = [
    new Product(1, 'Serveur VPS', 9.99),
    new Product(2, 'Nom de domaine', 12.5),
    new Product(3, 'Hébergement Web', 4.99),
  ];

  constructor(id, name, price) {
    this.#id = id;
    this.#name = name;
    this.#price = price;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get price() {
    return this.#price;
  }

  // Les champs privés ne sont pas sérialisés par JSON.stringify
  toJSON() {
    return { id: this.#id, name: this.#name, price: this.#price };
  }

  static findAll() {
    return Product.#data;
  }

  static findById(id) {
    return Product.#data.find((product) => product.id === Number(id)) ?? null;
  }

  static createOne(dto) {
    const { name, price } = dto ?? {};

    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Le nom est obligatoire et doit être une chaîne non vide.');
    }
    if (typeof price !== 'number' || !Number.isFinite(price)) {
      throw new Error('Le prix est obligatoire et doit être un nombre.');
    }
    if (price < 0) {
      throw new Error('Le prix ne peut pas être négatif.');
    }

    const nextId = Math.max(0, ...Product.#data.map((p) => p.id)) + 1;
    const product = new Product(nextId, name.trim(), price);
    Product.#data.push(product);
    return product;
  }
}

module.exports = Product;
