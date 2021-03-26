class CreateGraphColors < ActiveRecord::Migration[6.1]
  def change
    create_table :graph_colors do |t|
      t.string :used
      t.string :unused
      t.integer :user_id

      t.timestamps
    end
  end
end
