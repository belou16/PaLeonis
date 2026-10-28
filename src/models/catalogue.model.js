class Catalogue {
  #id;
  #name;
  #description;
  #price;

  constructor(id, name, description, price) {
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#price = price;
  }

  get id() {
    return this.#id;
  }
  get name() {
    return this.#name;
  }
  get description() {
    return this.#description;
  }
  get price() {
    return this.#price;
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      price: this.#price,
    };
  }

  // STATIC
  static #data = [
    new Catalogue(
      1,
      "Offre de base",
      "Accès aux fonctionnalités de base",
      9.99,
    ),
    new Catalogue(
      2,
      "Offre premium",
      "Accès à toutes les fonctionnalités",
      19.99,
    ),
    new Catalogue(
      3,
      "Offre entreprise",
      "Accès aux fonctionnalités avancées pour les entreprises",
      49.99,
    ),
  ];

  static findAll() {
    return Catalogue.#data;
  }

  static findById(id) {
    return (
      Catalogue.#data.find((catalogue) => catalogue.id === Number(id)) ?? null
    );
  }

  static createOne(dto) {
    const { name, description, price } = dto ?? {};

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(
        "Le nom est obligatoire et doit être une chaîne non vide.",
      );
    }
    if (typeof description !== "string" || description.trim() === "") {
      throw new Error(
        "La description est obligatoire et doit être une chaîne non vide.",
      );
    }
    if (typeof price !== "number" || !Number.isFinite(price)) {
      throw new Error("Le prix est obligatoire et doit être un nombre.");
    }
    if (price < 0) {
      throw new Error("Le prix ne peut pas être négatif.");
    }

    const nextId = Math.max(0, ...Catalogue.#data.map((c) => c.id)) + 1;
    const catalogue = new Catalogue(
      nextId,
      name.trim(),
      description.trim(),
      price,
    );
    Catalogue.#data.push(catalogue);
    return catalogue;
  }

  static updateOne(id, dto) {
    const catalogue = Catalogue.findById(id);
    if (!catalogue) {
      return null;
    }

    const { name, description, price } = dto ?? {};

    if (typeof name === "string" && name.trim() !== "") {
      catalogue.#name = name.trim();
    }
    if (typeof description === "string" && description.trim() !== "") {
      catalogue.#description = description.trim();
    }
    if (typeof price === "number" && Number.isFinite(price)) {
      if (price < 0) {
        throw new Error("Le prix ne peut pas être négatif.");
      }
      catalogue.#price = price;
    }

    return catalogue;
  }

  static deleteOne(id) {
    const index = Catalogue.#data.findIndex(
      (catalogue) => catalogue.id === Number(id),
    );
    if (index === -1) {
      return null;
    }
    const deletedCatalogue = Catalogue.#data.splice(index, 1)[0];
    return deletedCatalogue;
  }
}

module.exports = Catalogue;
