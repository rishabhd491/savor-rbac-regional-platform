import { PrismaClient, Role, Country, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // Create Users as requested
  const users = [
    { id: 'nick-fury', name: 'Nick Fury', email: 'nick.fury@shield.com', role: Role.ADMIN, country: Country.INDIA }, // Admin can see everything, let's set default country India
    { id: 'captain-marvel', name: 'Captain Marvel', email: 'carol@shield.com', role: Role.MANAGER, country: Country.INDIA },
    { id: 'captain-america', name: 'Captain America', email: 'steve@shield.com', role: Role.MANAGER, country: Country.AMERICA },
    { id: 'thanos', name: 'Thanos', email: 'thanos@titan.com', role: Role.MEMBER, country: Country.INDIA },
    { id: 'thor', name: 'Thor', email: 'thor@asgard.com', role: Role.MEMBER, country: Country.INDIA },
    { id: 'travis', name: 'Travis', email: 'travis@example.com', role: Role.MEMBER, country: Country.AMERICA },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
    console.log(`Created user: ${u.name}`);
  }

  const cuisines = {
    [Country.INDIA]: ['North Indian', 'South Indian', 'Punjabi', 'Bengali', 'Mughlai', 'Street Food', 'Gujarati', 'Rajasthani', 'Hyderabadi', 'Goan', 'Maharashtrian', 'Assamese', 'Kerala', 'Chettinad', 'Indo-Chinese'],
    [Country.AMERICA]: ['Burger Joint', 'Steakhouse', 'Pizza Parlor', 'Tex-Mex', 'BBQ Pit', 'Diner', 'Seafood Shack', 'New York Deli', 'Cajun Kitchen', 'California Grill', 'Hot Dog Stand', 'Bagel Shop', 'Donut Shop', 'Southern Fried', 'Hawaiian Poke']
  };

  const foodNames = {
    [Country.INDIA]: ['Paneer Butter Masala', 'Butter Chicken', 'Dal Makhani', 'Masala Dosa', 'Hyderabadi Biryani', 'Chole Bhature', 'Pav Bhaji', 'Dhokla', 'Vada Pav', 'Rogan Josh', 'Malai Kofta', 'Pani Puri', 'Gulab Jamun', 'Rasgulla', 'Lassi', 'Tandoori Chicken'],
    [Country.AMERICA]: ['Cheeseburger', 'BBQ Ribs', 'Pepperoni Pizza', 'Buffalo Wings', 'Hot Dog', 'Apple Pie', 'Clam Chowder', 'Philly Cheesesteak', 'Mac and Cheese', 'Fried Chicken', 'Tacos', 'Pancakes', 'Cornbread', 'Lobster Roll', 'Chocolate Chip Cookie', 'New York Cheesecake']
  };

  for (const country of [Country.INDIA, Country.AMERICA]) {
    for (let i = 1; i <= 15; i++) {
      const restaurantName = `${cuisines[country][i-1]} ${country === Country.INDIA ? 'Darbar' : 'Express'} #${i}`;
      const restaurant = await prisma.restaurant.create({
        data: {
          name: restaurantName,
          country: country,
        }
      });

      const menuItems = [];
      for (let j = 1; j <= 16; j++) {
        const baseFood = foodNames[country][(j-1) % foodNames[country].length];
        menuItems.push({
          name: `${baseFood} Special ${j}`,
          price: country === Country.INDIA ? 150 + (j * 20) : 10 + j,
          restaurantId: restaurant.id
        });
      }

      await prisma.menuItem.createMany({
        data: menuItems
      });

      console.log(`Created restaurant: ${restaurantName} with 16 items`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
