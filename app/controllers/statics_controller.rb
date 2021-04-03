class StaticsController < ApplicationController
  def setting
    @setammounts = SetAmmount.new()
  end

  def create
    @setammounts = Setammount.new(setting_params)
    respond_to do |format|
      if @setammount.save
        format.html { redirect_to @setammount.notice:'Setammounts was successfully created.'}
        format.json { render :show, status: :created, location: @book }
      else
      format.html { render :new }
      format.json { render json: @setammount.errors, status: :unprocessable_entity }
      end

  end

  def setting_params
    @setammounts = Setammount.new{setting_params}
    params.require(:setting).permit(:title, :memo)
  end
end
end
