const promisefs = require("fs/promises");
const readline = require("readline");
const chalk = require("chalk");
const table = require("cli-table3");
let currentUser;
let path;
let userInput;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = msg =>
  new Promise(resolve => rl.question(msg, response => resolve(response)));

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateProductId(allProducts) {
  let productId;
  let countObject = allProducts.find(product => product.count !== "undefined");
  countObject.count++;
  productId = `PR-${countObject.count}`;
  return productId;
}

async function adminMenu(option) {
  let userResponse;
  switch (option) {
    case "1":
      addProduct();
      break;

    case "2":
      displayAllProducts();
      break;

    case "3":
      editProduct();
      break;

    case "4":
      processOrder();
      break;

    case "5":
      getAllOrders();
      break;

    case "6":
      logout();
      break;

    default:
      console.log(chalk.red("\nInvalid input"));
      userInput = await ask("\nPlease select a valid option from the list: ");
      adminMenu(userResponse);
      break;
  }
}

function showAdminMenu() {
  console.log("1: Add product");
  console.log("2: All products");
  console.log("3: Edit product");
  console.log("4: Process order");
  console.log("5: All orders");
  console.log("6: Log out");
}

async function userMenu(option) {
  let userResponse;

  switch (option) {
    case "1":
      displayAllProducts();
      break;

    case "2":
      getMyPurchase();
      break;

    case "3":
      getAllOrders();
      break;
    case "4":
      searchOrders();
      break;

    case "5":
      logout();
      break;

    default:
      console.log(chalk.red("\nInvalid input"));
      userInput = await ask("\nPlease select a valid option from the list: ");
      userMenu(userResponse);
      break;
  }
}
function showUserMenu() {
  console.log("1: All products");
  console.log("2: My purchase");
  console.log("3: My orders");
  console.log("4: Search orders");
  console.log("5: Log out");
}

async function generalMenu(option) {
  let userResponse;
  switch (option) {
    case "1":
      register();
      break;

    case "2":
      login();
      break;

    case "3":
      console.log(chalk.green("\nThank you for choosing us always"));
      rl.close();
      break;

    default:
      console.log(chalk.red("\nInvalid input"));
      userInput = await ask("\nPlease select a valid option from the list: ");
      generalMenu(userResponse);
      break;
  }
}

function showGeneralMenu() {
  console.log("1: Register");
  console.log("2: Log in");
  console.log("3: Exit");
}

async function displayAllProducts() {
  let newTable = new table({
    head: ["Product Id", "Product Name", "Price"],
  });
  let allProducts = await readProductsDatabase();
  console.log("\nWe have all kinds of products available\n");
  allProducts = allProducts.filter(product => !product.count);
  allProducts
    .slice(0, 11)
    .map(product => newTable.push([product.id, product.name, product.price]));
  console.log(newTable.toString());
  userInput = (await ask("\nSelect an option to continue: "))
    .trim()
    .toUpperCase();
  getSingleProduct(userInput);
}

async function getSingleProduct(productId) {
  let allProducts = await readProductsDatabase();
  let requiredProduct = allProducts.find(
    product => product.id === productId
  );

  if (!requiredProduct) {
    console.log(chalk.red("\nNo product with this Id was found\n"));
    if (currentUser && currentUser.isLoggedIn && currentUser.isAdmin) {
      let userResponse = (
        await ask("\nEnter a valid product Id or enter R to return: ")
      ).toUpperCase();
      if (userResponse === "R") {
        showAdminMenu();
        userResponse = await ask("Select an option: ");
        adminMenu(userResponse);
      } else {
        getSingleProduct(userResponse.toUpperCase());
      }
    } else if (currentUser && currentUser.isLoggedIn && !currentUser.isAdmin) {
      let userResponse = (
        await ask("Enter a valid product Id or enter R to return: ")
      ).toUpperCase();
      if (userResponse === "R") {
        showUserMenu();
        userResponse = await ask("Enter an option to continue: ");
        userMenu(userResponse);
      } else {
        getSingleProduct(userResponse);
      }
    } else {
      await welcomeMessage();
    }

    return;
  }
  console.log("product found");
}

function pagination(option) {
  switch (option) {
    case "pg1":
      break;

    case "pg2":
      break;

    case "pg3":
      break;

    default:
      break;
  }
}
function showPagination() {
  console.log("pg1");
  console.log("pg1");
  console.log("pg3");
}

async function readProductsDatabase() {
  let allProducts = [];
  let data;
  try {
    data = await promisefs.readFile("products.json", "utf-8");
    if (data) {
      allProducts = JSON.parse(data);
    }
  } catch (e) {
    console.log(e.message);
  }

  return allProducts;
}
async function writeProductsDatabase(newProductsData) {
  try {
    promisefs.writeFile("products.json", JSON.stringify(newProductsData));
  } catch (e) {
    console.log(e.message);
  }
}

async function readUsersDatabase() {
  let usersData = [];
  let data;
  try {
    data = await promisefs.readFile("database.json", "utf-8");
    if (data) {
      usersData = JSON.parse(data);
    }
  } catch (e) {
    console.log(e.message);
  }

  return usersData;
}
async function writeUsersDatabase(newUsersData) {
  try {
    promisefs.writeFile("database.json", JSON.stringify(newUsersData));
  } catch (e) {
    console.log(e.message);
  }
}

async function register() {
  const usersData = await readUsersDatabase();

  let fullName;
  let userEmail;
  let userPassword;

  console.log(
    chalk.green("\nThank you for choosing to tde with us. Enter your details\n")
  );

  fullName = (await ask("Enter your full name: ")).trim();
  while (fullName.length < 6) {
    fullName = (await ask("Full name must be at least 6 characters: ")).trim();
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmail = (await ask("\nEnter your email: ")).trim();

  let existingUser = usersData.find(user => user.email === userEmail);

  while (!emailRegex.test(userEmail) || existingUser) {
    if (!emailRegex.test(userEmail)) {
      userEmail = (await ask("Enter  a valid email: ")).trim();
    } else if (existingUser) {
      userEmail = (await ask("Email already taken: ")).trim();
    }

    if (!emailRegex.test(userEmail)) {
      continue;
    }
    existingUser = usersData.find(user => user.email === userEmail);
  }

  userPassword = (
    await ask(
      "Enter a password. Password must be at least 6 characters with no spaces: "
    )
  ).trim();

  while (userPassword.length < 6 || userPassword.includes(" ")) {
    userPassword = await ask("Enter at least 6 characters with no spaces: ");
  }

  const newUser = {
    id: crypto.randomUUID(),
    fullName: fullName,
    email: userEmail,
    password: userPassword,
    isLoggedIn: false,
    isAdmin: false,
    purchase: [],
    allOrders: [],
  };
  usersData.push(newUser);
  await writeUsersDatabase(usersData);
  console.log(chalk.yellow("\nProcessing....."));
  await delay(1000);
  console.log(chalk.green("\n*****Registration Successful*****\n"));
  showGeneralMenu();

  let userResponse = await ask("\nSelect an option to continue: ");
  generalMenu(userResponse);
}

async function login() {
  let usersData = await readUsersDatabase();
  let userEmail;
  let userPassword;

  console.log(chalk.green("\n*****It's a pleasure to have you back*****"));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmail = (await ask("\nEnter your registered email: ")).trim();

  while (!emailRegex.test(userEmail)) {
    userEmail = (await ask("Enter a valid email: ")).trim();
  }

  userPassword = (
    await ask("Enter a password, at least 6 characters with no spaces: ")
  ).trim();

  while (userPassword.length < 6 || userPassword.includes(" ")) {
    userPassword = (
      await ask("Enter at least 6 characters with no spaces: ")
    ).trim();
  }

  const existingUser = usersData.find(
    user => user.email === userEmail && user.password === userPassword
  );

  if (!existingUser) {
    console.log(chalk.red("\nInvalid credentials\n"));
    showGeneralMenu();
    let userResponse = await ask("\nSelect an option to continue: ");
    generalMenu(userResponse);
    return;
  }

  existingUser.isLoggedIn = true;
  currentUser = existingUser;
  await writeUsersDatabase(usersData);
  console.log(chalk.green("\n*****Log in successful*****\n"));
  if (existingUser.isAdmin) {
    showAdminMenu();
    let userResponse = await ask("\nSelect an option to continue: ");
    adminMenu(userResponse);
  } else {
    showUserMenu();
    let userResponse = await ask("\nSelect an option to continue: ");
    userMenu(userResponse);
  }
}

async function logout() {
  const usersData = await readUsersDatabase();
  const existingUser = usersData.find(
    user => user.email === currentUser.email && user.id === currentUser.id
  );
  existingUser.isLoggedIn = false;
  await writeUsersDatabase(usersData);
  console.log(chalk.green("\nThank you for choosing us always\n"));
  rl.close();
}

async function addProduct() {
  const allProducts = await readProductsDatabase();
  let ProductName = (await ask("Product name: ")).trim();
  while (ProductName.length < 1) {
    ProductName = (await ask("Product name: ")).trim();
  }

  let productPrice = Number((await ask("Product price: $")).trim());
  while (productPrice < 1 || isNaN(productPrice)) {
    productPrice = Number((await ask("Product price: $")).trim());
  }

  let productDescription = (
    await ask("What is this product all about: ")
  ).trim();
  while (productDescription.length < 1) {
    productDescription = (await ask("Add product description: ")).trim();
  }

  const newProduct = {
    id: generateProductId(allProducts),
    name: ProductName,
    price: productPrice,
    description: productDescription,
  };

  allProducts.push(newProduct);

  await writeProductsDatabase(allProducts);
  console.log(chalk.green("\n*****Product added succesfully*****\n"));
  showAdminMenu();
  let adminResponse = await ask("\nWhat do you wish to do next: ");
  adminMenu(adminResponse);
}

async function editProduct() {
  const allProducts = await readProductsDatabase();
  let productId = (await ask("\nEnter the product Id: ")).trim().toUpperCase();
  let productToEdit = allProducts.find(product => product.id === productId);

  if (!productToEdit) {
    console.log(chalk.red("\nNo product with this Id was found"));
    editProduct();
    return;
  }
  let newProductName = (
    await ask(`\nCurrent name: ${productToEdit.name}\nNew name: `)
  ).trim();
  while (newProductName.length < 1) {
    newProductName = productToEdit.name;
  }

  let newProductPrice = Number(
    (await ask(`\nCurrent price: ${productToEdit.price}\nNew price: $`)).trim()
  );
  while (
    newProductPrice < 1 ||
    isNaN(newProductPrice) ||
    newProductPrice === productToEdit.price
  ) {
    if (newProductPrice < 1 || isNaN(newProductPrice)) {
      newProductPrice = Number((await ask("New price: $")).trim());
    } else {
      newProductPrice = productToEdit.price;
    }
  }

  let newProductDescription = (
    await ask(
      `\nCurrent description: ${productToEdit.description}\nNew description: `
    )
  ).trim();

  while (newProductDescription === "") {
    newProductDescription = productToEdit.description;
  }
  productToEdit.name = newProductName;
  productToEdit.price = newProductPrice;
  productToEdit.description = newProductDescription;

  await writeProductsDatabase(allProducts);
  console.log(chalk.green("\nProduct update succesfully\n"));
  showAdminMenu();
  let adminResponse = await ask("\nWhat do you wish to do next: ");
  adminMenu(adminResponse);
}

async function welcomeMessage() {
  showGeneralMenu();

  let userInput = (await ask("Enter an valid option or a valid producId: ")).trim().toUpperCase()
  console.log(userInput)
  while (
    userInput !== "1" &&
    userInput !== "2" &&
    userInput !== "3" &&
    !userInput.includes("PR-")
  ) {
    userInput = (await ask("Enter a valid option or a valid product Id: ")).trim().toUpperCase();
  }

  if (userInput === "1" || userInput === "2" || userInput === "3") {
    generalMenu(userInput);
  } else if(userInput.includes("PR-")){
    getSingleProduct(userInput);
  }
}

welcomeMessage();
  console.log("\nWelcome to CLI Ecommerce\n");
displayAllProducts();
