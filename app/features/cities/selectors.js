export const selectCitiesState = (state) => state.cities;
export const selectAllCities = (state) => state.cities.items;
export const selectCitiesStatus = (state) => state.cities.status;
export const selectCitiesError = (state) => state.cities.error;

export const selectCityByName = (state, cityName) =>
  state.cities.items.find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );