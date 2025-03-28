Rails.application.routes.draw do
  get "communes/show"
  root "home#index"
  get "/communes/:insee_code", to: "communes#show", as: "commune"
  get "/autocomplete", to: "autocomplete#communes"
end
