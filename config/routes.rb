# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users
  root to: 'landing#index'

  resources :courses do
    collection do
      get :categories
      get :fullsearch
      get :search
    end
  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
