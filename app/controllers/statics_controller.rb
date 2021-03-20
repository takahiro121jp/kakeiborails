class StaticsController < ApplicationController
  def setting
    @setammount = Setammount.new()
  end
end
