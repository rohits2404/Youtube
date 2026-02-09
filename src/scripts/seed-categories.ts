import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryName = [
    "Cars and Vehicles",
    "Comedy",
    "Education",
    "Gaming",
    "Entertainment",
    "Film and Animation",
    "How-To and Style",
    "Music",
    "News and Politics",
    "People and Blogs",
    "Pets and Animals",
    "Science and Technology",
    "Sports",
    "Travel and Events"
]

async function main() {
    console.log("Seeding Categories...");
    try {
        const values = categoryName.map((name) => ({
            name,
            description: `Videos Related to ${name.toLowerCase()}`
        }))
        await db.insert(categories).values(values);
        console.log("Categories Seeded Successfully!")
    } catch (error) {
        console.error("Error Seeding Categories: ", error);
        process.exit(1)
    }
}

main();