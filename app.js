const promisefs = require("fs/promises");
const readline = require("readline");
const chalk = require("chalk");
const table = require("cli-table3");
let currentUser;
let productUpdate;

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
      adminDisplayAllProducts();
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
      adminDisplayAllProducts();
      break;

    case "2":
      getMyPurchase();
      break;

    case "3":
      getMyOrders();
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
  let allProducts = await readProductsDatabase();

  allProducts = allProducts.filter(product => !product.count);
if(allProducts.length .0 0 ){
  let newTable = new table({
    head: ["Product Id", "Product Name", "Price"],
  });
    allProducts
    .slice(0, 11)
    .map(product => newTable.push([product.id, product.name, product.price]));
  console.log(newTable.toString());
}else{
  console.log(chalk.red("No product in stock"))
}
}

async function adminDisplayAllProducts() {
  await displayAllProducts();
  let userResponse = (
    await ask("\nEnter a valid product Id to see more details: ")
  )
    .trim()
    .toUpperCase()
    .trim()
    .toUpperCase();
  getSingleProduct(userResponse);
}

async function getSingleProduct(productId) {
  let allProducts = await readProductsDatabase();
  let requiredProduct = allProducts.find(product => product.id === productId);

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
  let newTable = new table({
    head: ["Product Id", "Product Name", "Price", "Description"],
  });
  newTable.push([
    requiredProduct.id,
    requiredProduct.name,
    requiredProduct.price,
    requiredProduct.description,
  ]);
  console.log(newTable.toString());
  productUpdate = requiredProduct
  if (currentUser && currentUser.isAdmin) {
    console.log("\n1: Edit product");
    let userResponse = await ask(
      "\nSelect 1 to edit or any option to return to menu: "
    );
    if (userResponse === "1") {
      adminMenu("3");
    } else {
      showAdminMenu();
      userResponse = await ask("\nSelect an option to continue: ");
      adminMenu(userResponse);
    }
  } else if (currentUser && !currentUser.isAdmin) {
    console.log("\n1: Buy product");
    let userResponse = await ask(
      "\nSelect 1 to buy or any option to return to menu: "
    );
    if (userResponse === "1") {
      buyProduct(requiredProduct);
    } else {
      showUserMenu();
      userResponse = await ask("\nSelect an option to continue: ");
      userMenu(userResponse);
    }
  } else {
    console.log("\nLog in or sign up to see more\n");
    showGeneralMenu();
    let userResponse = (await ask("\nSelect an option to continue: ")).trim();
    generalMenu(userResponse);
  }
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
  let productId;
  if(productUpdate){
    productId = productUpdate.id
  }else{
    productId = (await ask("\nEnter the product Id: ")).trim().toUpperCase();
  }
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

async function buyProduct(product) {
  console.log("\nWe are here to serve you better\n");

  const usersData = await readUsersDatabase();
  const admin = usersData.find(user => user.isAdmin);
  const existingUser = usersData.find(user => user.id === currentUser.id);

  let qty = Number((await ask("Quantity you wish to buy: ")).trim());
  while (qty < 1 || isNaN(qty)) {
    qty = Number((await ask("Enter a valid quantity: ")).trim());
  }
  const newOrder = {
    orderId: crypto.randomUUID(),
    userId: currentUser.id,
    productName: product.name,
    Quantity: qty,
    productPrice: product.price,
    total: qty * product.price,
    date: ( new Date(Date.now())).toLocaleString(),
    orderStatus: "pending",
  };
  existingUser.allOrders.push(newOrder);
  admin.allOrders.push(newOrder);

  await writeUsersDatabase(usersData);
  console.log(
    chalk.green(`\nAn order with Id ${newOrder.orderId} has been created\n`)
  );
  showUserMenu();
  let userResponse = await ask("\nWhat else would you love to do? ");
  userMenu(userResponse);
}

async function getAllOrders() {
  const usersData = await readUsersDatabase();
  const admin = usersData.find(user => user.id === currentUser.id);
  const pendingOrders =
    admin.allOrders.length > 0 &&
    admin.allOrders.filter(order => order.orderStatus === "pending");
  const completedOrders =
    admin.allOrders.length > 0 &&
    admin.allOrders.filter(order => order.orderStatus === "completed");
  admin.allOrders.length > 0 &&
    console.log(
      `There are total of  ${admin.allOrders.length} orders. \n${pendingOrders.length} pending. \n${completedOrders.length} completed\n`
    );

  let newTable = new table({
    head: [
      "Order Id",
      "User Id",
      "Order Status",
      "Date",
      "Product name",
      "Product price",
      "Quantity",
      "Total",
    ],
  });
  admin.allOrders.length > 0 &&
    admin.allOrders.forEach(order =>
      newTable.push([
        order.orderId,
        order.userId,
        order.orderStatus,
        order.date,
        order.productName,
        order.productPrice,
        order.Quantity,
        order.total,
      ])
    );
  console.log(newTable.toString());
  console.log("\n");
  showAdminMenu();
  let userResponse = await ask(
    "\nWhat else do you wish to do? Select an option: "
  );
  adminMenu(userResponse);
}

async function getMyOrders() {
  const usersData = await readUsersDatabase();
  const existingUser = usersData.find(user => user.id === currentUser.id);

  const pendingOrders =
    existingUser.allOrders.length > 0 &&
    existingUser.allOrders.filter(order => order.orderStatus === "pending");
  const completedOrders =
    existingUser.allOrders.length > 0 &&
    existingUser.allOrders.filter(order => order.orderStatus === "completed");
  existingUser.allOrders.length > 0 &&
    console.log(
      `\nYou have a total of  ${existingUser.allOrders.length} orders. \n${pendingOrders.length} pending. \n${completedOrders.length} completed\n`
    );

  let newTable = new table({
    head: [
      "Order Id",
      "User Id",
      "Order Status",
      "date",
      "Product name",
      "Product price",
      "Quantity",
      "Total",
    ],
  });
  existingUser.allOrders.length > 0 &&
    existingUser.allOrders.forEach(order =>
      newTable.push([
        order.orderId,
        order.userId,
        order.orderStatus,
        order.date,
        order.productName,
        order.productPrice,
        order.Quantity,
        order.total,
      ])
    );
  console.log(newTable.toString());
  console.log("\n");
  showUserMenu();
  let userResponse = await ask("\nWhat else do you wish to do: ");
  userMenu(userResponse);
}

async function searchOrders() {
  const usersData = await readUsersDatabase();
  const existingUser = usersData.find(user => user.id === currentUser.id);
  let newTable = new table({
    head: [
      "Order Id",
      "User Id",
      "Order Status",
      "date",
      "Product name",
      "Product price",
      "Quantity",
      "Total",
    ],
  });

  let userResponse = (await ask("Please enter the order Id: ")).trim();

  const order = existingUser.allOrders.find(
    order => order.orderId === userResponse
  );
  if (order) {
    newTable.push([
      order.orderId,
      order.userId,
      order.orderStatus,
      order.date,
      order.productName,
      order.productPrice,
      order.Quantity,
      order.total,
    ]);
    console.log(newTable.toString());
    console.log("\n");
  } else {
    console.log(
      chalk.red("\nNo order with this Id was found. view all orders instead\n")
    );
  }

  showUserMenu();
  userResponse = await ask("\nSelect an option to continue: ");
  userMenu(userResponse);
}

async function getMyPurchase() {
  const usersData = await readUsersDatabase();
  const existingUser = usersData.find(user => user.id === currentUser.id);
  console.log(currentUser);
  let newTable = new table({
    head: [
      "Order Id",
      "date",
      "Product name",
      "Product price",
      "Quantity",
      "Total",
    ],
  });

  if (existingUser.purchase.length > 0) {
    existingUser.purchase.forEach(product => {
      newTable.push([
        product.orderId,
        product.date,
        product.productName,
        product.productPrice,
        product.Quantity,
        product.total,
      ]);
    });

    console.log(newTable.toString());
  } else {
    console.log(
      chalk.red(
        "\nYou have not made any purchase or your orders are still pending\n"
      )
    );
  }

  showUserMenu();
  let userResponse = await ask(
    "\nWhat else do you wish to do. Select an option to continue: "
  );
  userMenu(userResponse);
}

async function processOrder() {
  const usersData = await readUsersDatabase();
  const admin = usersData.find(user => user.id === currentUser.id);

  let orderId = (await ask("Enter the order Id: ")).trim();
  while (orderId === "") {
    orderId = (await ask("Enter the order Id: ")).trim();
  }

  let orderToUpdate = admin.allOrders.find(order => order.orderId === orderId);
  if (orderToUpdate) {
    orderToUpdate.orderStatus = "completed";
    const orderOwner = usersData.find(user => user.id === orderToUpdate.userId);
    let theOrder = orderOwner.allOrders.find(
      order => order.orderId === orderId
    );
    theOrder.orderStatus = "completed";
    orderOwner.purchase.push(theOrder);
    await writeUsersDatabase(usersData)
    console.log(chalk.green("\nOrder succesfully processed. OderStatus: completed\n"))
  } else {
    console.log(chalk.red("\nNo order with this Id was found\n"))
  }

  showAdminMenu();
  let userResponse = await ask(
    "\nWhat else do you wish to do. Select an option to continue: "
  );
}


async function welcomeMessage() {
  console.log("\nWelcome to CLI Ecommerce\n");
  showGeneralMenu();
  await displayAllProducts();
  let isValid = false;
  while (!isValid) {
    let userInput = (await ask("Enter an option or a valid product Id: "))
      .trim()
      .toUpperCase();

    if (userInput === "1" || userInput === "2" || userInput === "3") {
      generalMenu(userInput);
      isValid = true;
    } else if (userInput.includes("PR-")) {
      getSingleProduct(userInput);
      isValid = true;
    } else {
      console.log(chalk.red("\nInvalid input. Please try again.\n"));
    }
  }
}

welcomeMessage();
