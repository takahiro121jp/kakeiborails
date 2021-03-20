class CreateGraphColors < ActiveRecord::Migration[6.1]
  def change
    create_table :graph_colors do |t|
      t.string :used
      t.string :string
      t.string :unused
      t.string :string
      t.string :user_id
      t.string :integer

      t.timestamps
    end
  end
end
