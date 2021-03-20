class CreateSetAmmounts < ActiveRecord::Migration[6.1]
  def change
    create_table :set_ammounts do |t|
      t.string :price
      t.string :integer
      t.string :user_id
      t.string :integer

      t.timestamps
    end
  end
end
