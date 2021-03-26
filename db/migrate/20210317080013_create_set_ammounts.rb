class CreateSetAmmounts < ActiveRecord::Migration[6.1]
  def change
    create_table :set_ammounts do |t|
      t.integer :price
      t.integer :user_id

      t.timestamps
    end
  end
end
