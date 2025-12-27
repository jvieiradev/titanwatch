import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJaegersTable1703000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'jaegers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'mark', type: 'int' },
          { name: 'status', type: 'varchar' },
          { name: 'integrity_level', type: 'int' },
          { name: 'height', type: 'decimal', precision: 6, scale: 2 },
          { name: 'weight', type: 'decimal', precision: 8, scale: 2 },
          { name: 'power_core', type: 'varchar' },
          { name: 'weapons', type: 'text' },
          { name: 'base_location', type: 'varchar' },
          { name: 'deployment_count', type: 'int', default: 0 },
          { name: 'kill_count', type: 'int', default: 0 },
          { name: 'last_maintenance', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'pilots',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar' },
          { name: 'rank', type: 'varchar' },
          { name: 'status', type: 'varchar' },
          { name: 'drift_compatibility', type: 'int' },
          { name: 'combat_hours', type: 'int', default: 0 },
          { name: 'kill_count', type: 'int', default: 0 },
          { name: 'nationality', type: 'varchar' },
          { name: 'jaeger_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
        foreignKeys: [
          {
            columnNames: ['jaeger_id'],
            referencedTableName: 'jaegers',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pilots');
    await queryRunner.dropTable('jaegers');
  }
}
