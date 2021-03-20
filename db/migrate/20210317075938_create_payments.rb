class CreatePayments < ActiveRecord::Migration[6.1]
  def change
    create_table :payments do |t|
      t.string :total_ammount
      t.string :integer
      t.string :payment_date
      t.string :date
      t.string :user_id
      t.string :integer

      t.timestamps
    end
  end
end
