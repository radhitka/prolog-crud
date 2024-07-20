let navbar = document.getElementById("navbar");
let user = JSON.parse(localStorage.getItem("user")) || null;

// Add navbar component
navbar.className = "w-full bg-white shadow-md py-4";
navbar.insertAdjacentHTML(
  "beforeend",
  `
    <div class="container mx-auto flex justify-between items-center px-6">
        <a href="#" class="text-2xl font-bold">baca.quran</a>
        <div class="flex space-x-8">
          <a href="/" class="font-semibold text-gray-700 hover:text-blue-500 hover:underline"
            >Home</a
          >
          <a
            href="/surah"
            class="font-semibold text-gray-700 hover:text-blue-500 hover:underline"
            >Surah</a
          >
          <a
            href="/profile"
            id="profile-link"
            class="font-semibold text-gray-700 hover:text-blue-500 hover:underline hidden"
            >Profile</a
          >
          <a
            href="/login"
            id="login-link"
            class="font-semibold text-gray-700 hover:text-blue-500 hover:underline"
            >Login</a
          >
        </div>
      </div>
    `
);

let profileLink = document.getElementById("profile-link");
let loginLink = document.getElementById("login-link");
if (user?.username) {
  profileLink.classList.remove("hidden");
  loginLink.classList.add("hidden");
} else {
  profileLink.classList.add("hidden");
  loginLink.classList.remove("hidden");
}
