Rails.application.routes.draw do
  get 'statics/setting'
  root to: "payments#index"

  get 'payments/edit'
  get 'payments/show'
  get 'payments/index'

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
