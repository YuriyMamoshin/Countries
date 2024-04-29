import LINK from "./link.js";

class Country {
  constructor(name, region, capital, flag, population) {
    this.name = name;
    this.region = region;
    this.capital = capital;
    this.flag = flag;
    this.population = population;
  }

  createPagagraph(content, explanation) {
    const paragraph = document.createElement("p");
    const spanExplanation = document.createElement("span");
    spanExplanation.innerText = explanation;
    spanExplanation.className = "country__explanation";

    const spanContent = document.createElement("span");
    spanContent.innerText = content;
    paragraph.appendChild(spanExplanation);
    paragraph.appendChild(spanContent);

    return paragraph;
  }

  defineTheme(element) {
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "light");
    } else if (localStorage.getItem("theme") === "dark") {
      element.classList.add("country_dark");
    } else {
      element.classList.remove("country_dark");
    }
  }

  createCountryElement() {
    const countryElement = document.createElement("li");
    countryElement.classList.add("country");
    this.defineTheme(countryElement);

    const flagImage = document.createElement("img");
    flagImage.src = this.flag;
    flagImage.classList.add("country__flag");
    countryElement.appendChild(flagImage);

    const infoContainer = document.createElement("article");
    infoContainer.classList.add("country__info");

    const nameElement = document.createElement("h3");
    nameElement.innerText = this.name;
    nameElement.classList.add("country__name");
    infoContainer.appendChild(nameElement);

    const popElement = this.createPagagraph(this.population, "Population: ");
    infoContainer.appendChild(popElement);

    const regElement = this.createPagagraph(this.region, "Region: ");
    infoContainer.appendChild(regElement);

    const capElement = this.createPagagraph(this.capital, "Capital: ");
    infoContainer.appendChild(capElement);

    countryElement.appendChild(infoContainer);

    return countryElement;
  }
}

class App {
  constructor() {
    this.bodyElement = document.querySelector("body");

    this.themeButton = document.querySelector(".header__theme");
    this.themeButton.addEventListener("click", () => this.toggleTheme());

    this.searchBar = document.querySelector(".search-bar");
    this.searchBar.addEventListener("input", (event) => {
      this.search = event.target.value;
      this.renderContent();
    });

    this.filterState = { value: "Region", isDown: false };

    this.filtersList = document.querySelector(".filter-list");

    this.filterButton = document.querySelector(".filter-button");
    this.renderfilterButton(this.filterState.value);
    this.filterButton.addEventListener("click", () => this.toggleFiltersList());

    this.pointerElement = document.querySelector(".pointer");

    this.outputContainer = document.querySelector(".output-container");
  }

  defineDarkness() {
    if (localStorage.getItem("theme") === "dark") {
      this.bodyElement.classList.add("dark");
      this.searchBar.classList.add("dark");
      this.filterButton.classList.add("dark");
      this.filtersList.classList.add("dark");
      this.pointerElement.classList.add("pointer_dark");
      this.themeButton.classList.add("header__theme_dark");
    } else {
      this.bodyElement.classList.remove("dark");
      this.searchBar.classList.remove("dark");
      this.filterButton.classList.remove("dark");
      this.filtersList.classList.remove("dark");
      this.pointerElement.classList.remove("pointer_dark");
      this.themeButton.classList.remove("header__theme_dark");
    }
  }

  toggleTheme() {
    const newTheme =
      localStorage.getItem("theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    this.defineDarkness();
    this.renderContent();
  }

  renderfilterButton(value) {
    this.filterButton.innerText = value;
  }

  toggleFiltersList() {
    if (!this.filterState.isDown) {
      this.filtersList.classList.add("filter-list_down");
      this.pointerElement.classList.add("pointer_down");
      this.filterState.isDown = true;
    } else {
      this.filterState.value = "Region";
      this.hideFilters();
    }
  }

  hideFilters() {
    this.filtersList.classList.remove("filter-list_down");
    this.pointerElement.classList.remove("pointer_down");
    this.filterState.isDown = false;
    this.renderContent();
    this.renderfilterButton(this.filterState.value);
  }

  selectFilter(event) {
    this.filterState.value = event.target.textContent;
    this.hideFilters();
  }

  createFilters() {
    this.filtersSet = new Set();
    this.contentArray.map((country) => this.filtersSet.add(country.region));

    for (let filter of this.filtersSet) {
      const filterElement = document.createElement("li");
      filterElement.innerText = filter;
      filterElement.classList.add("filter-list__item");
      filterElement.addEventListener("click", (event) =>
        this.selectFilter(event)
      );
      this.filtersList.appendChild(filterElement);
    }
  }

  async getCountries() {
    const countriesJSON = await fetch(LINK);
    const countriesArray = await countriesJSON.json();
    this.processData(countriesArray);
  }

  processData(dataArray) {
    this.contentArray = dataArray.map(
      (country) =>
        new Country(
          country.name.common,
          country.region,
          country.capital[0],
          country.flags.svg,
          country.population
        )
    );
    this.createFilters();
    this.renderContent();
  }

  renderContent() {
    this.clearApp();
    this.defineDarkness();

    let filteredArray = this.contentArray;

    if (this.filterState.value !== "Region")
      filteredArray = this.contentArray.filter(
        (element) => element.region === this.filterState.value
      );

    for (let element of filteredArray) {
      if (
        !this.search ||
        element.name.toLowerCase().includes(this.search.toLowerCase())
      ) {
        this.outputContainer.appendChild(element.createCountryElement());
      }
    }
  }

  clearApp() {
    this.outputContainer.innerHTML = "";
  }
}

const app = new App();
app.getCountries();
