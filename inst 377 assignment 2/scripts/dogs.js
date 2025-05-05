// Voice Commands
if (annyang) {
  const commands = {
    'hello': () => alert('Hello World'),
    'change the color to *color': (color) => {
      document.body.style.backgroundColor = color;
    },
    'navigate to *page': (page) => {
      const target = page.toLowerCase();
      if (target.includes('home')) window.location.href = 'main.html';
      else if (target.includes('stocks')) window.location.href = 'stocks.html';
      else if (target.includes('dogs')) window.location.href = 'dogs.html';
    },
    'load dog breed *breedName': async (breedName) => {
  try {
    // Normalize spoken breed name (e.g., lowercase, trim)
    const spokenName = breedName.trim().toLowerCase();

    let allBreeds = [];
    let nextUrl = 'https://dogapi.dog/api/v2/breeds';

    // Paginate through all breeds
    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();
      allBreeds = allBreeds.concat(data.data);
      nextUrl = data.links?.next || null;
    }

    // Try to match spoken breed with API breed names
    const match = allBreeds.find(b =>
      b.attributes.name.toLowerCase() === spokenName
    );

    if (match) {
      loadBreedInfo(match.id);
    } else {
      alert(`Could not find dog breed "${breedName}". Please try again.`);
    }

  } catch (error) {
    console.error('Error loading breed via voice:', error);
    alert("Something went wrong while fetching breeds.");
  }
}

  };

  annyang.addCommands(commands);
} else {
  console.warn('Annyang is not supported in this browser.');
}
let currentIndex = 0; // Start from the first dot (index 0)
const totalImages = 9; // Total number of images (dots)

// The dots container
const dots = document.getElementById("dots");

function updateDots() {
  // Generate the dot sequence with the current one marked as "⭕"
  dots.innerHTML = "⚪".repeat(currentIndex) + "⭕" + "⚪".repeat(totalImages - currentIndex - 1);
}

document.getElementById("next-btn").addEventListener("click", () => {
  // Move to the next dot (circular movement)
  currentIndex = (currentIndex + 1) % totalImages;
  updateDots();
});

document.getElementById("prev-btn").addEventListener("click", () => {
  // Move to the previous dot (circular movement)
  currentIndex = (currentIndex - 1 + totalImages) % totalImages;
  updateDots();
});

// Initialize dots on page load
updateDots();

let dogImages = [];
let currentImageIndex = 0;

async function loadAllBreeds() {
  const container = document.getElementById("breed-names");
  const loadingMessage = document.getElementById("loading-message");
  let allBreeds = [];
  let nextPage = "https://dogapi.dog/api/v2/breeds";

  loadingMessage.style.display = "block";
  container.style.display = "none";

  try {
    // Fetch all breeds
    while (nextPage) {
      const response = await fetch(nextPage);
      const data = await response.json();
      allBreeds = [...allBreeds, ...data.data];
      nextPage = data.links.next;
    }

    // Fetch 10 random dog images
    const imageResponse = await fetch("https://dog.ceo/api/breeds/image/random/10");
    const imageData = await imageResponse.json();
    dogImages = imageData.message;

    // Setup carousel
    updateCarouselImage();

    // Pick 10 random breeds and display them
    const randomBreeds = getRandomBreeds(allBreeds, 10);
    randomBreeds.forEach((breed) => {
      const button = document.createElement("button");
      button.textContent = breed.attributes.name;
      button.classList.add("button-33");
      button.addEventListener("click", () => loadBreedInfo(breed.id));
      container.appendChild(button);
    });

    loadingMessage.style.display = "none";
    container.style.display = "block";

  } catch (error) {
    console.error("Error fetching data:", error);
    container.textContent = "Failed to load dog breeds.";
    loadingMessage.style.display = "none";
    container.style.display = "block";
  }
}

function getRandomBreeds(breeds, count) {
  const selected = [];
  const used = new Set();
  while (selected.length < count) {
    const i = Math.floor(Math.random() * breeds.length);
    if (!used.has(i)) {
      used.add(i);
      selected.push(breeds[i]);
    }
  }
  return selected;
}

function updateCarouselImage() {
  const carouselImage = document.getElementById("carousel-image");
  carouselImage.src = dogImages[currentImageIndex];
}

document.getElementById("prev-btn").addEventListener("click", () => {
  currentImageIndex = (currentImageIndex - 1 + dogImages.length) % dogImages.length;
  updateCarouselImage();
});

document.getElementById("next-btn").addEventListener("click", () => {
  currentImageIndex = (currentImageIndex + 1) % dogImages.length;
  updateCarouselImage();
});

async function loadBreedInfo(breedId) {
  const infoContainer = document.getElementById("breed-info");
  try {
    const response = await fetch(`https://dogapi.dog/api/v2/breeds/${breedId}`);
    const data = await response.json();
    const breed = data.data;

    infoContainer.innerHTML = `
      <h3>${breed.attributes.name}</h3>
      <p><strong>Description:</strong> ${breed.attributes.description}</p>
      <p><strong>Life Span:</strong> ${breed.attributes.life.min} - ${breed.attributes.life.max} years</p>
    `;
    infoContainer.style.display = "block";
  } catch (error) {
    console.error("Error fetching breed info:", error);
    infoContainer.innerHTML = "Failed to load breed information.";
    infoContainer.style.display = "block";
  }
}

loadAllBreeds();

