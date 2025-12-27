import { Jaeger, JaegerProps, JaegerStatus } from '../../../domain/entities/Jaeger';
import { Pilot, PilotProps, PilotRank, PilotStatus } from '../../../domain/entities/Pilot';
import { JaegerMark } from '../../../domain/value-objects/JaegerMark';
import { IntegrityLevel } from '../../../domain/value-objects/IntegrityLevel';
import { JaegerSchema } from '../entities/JaegerSchema';
import { PilotSchema } from '../entities/PilotSchema';

export class JaegerMapper {
  static toDomain(schema: JaegerSchema): Jaeger {
    const props: JaegerProps = {
      id: schema.id,
      name: schema.name,
      mark: JaegerMark.create(schema.mark),
      status: schema.status as JaegerStatus,
      integrityLevel: IntegrityLevel.create(schema.integrityLevel),
      height: Number(schema.height),
      weight: Number(schema.weight),
      powerCore: schema.powerCore,
      weapons: schema.weapons,
      baseLocation: schema.baseLocation,
      pilots: schema.pilots?.map((p) => this.pilotToDomain(p)),
      deploymentCount: schema.deploymentCount,
      killCount: schema.killCount,
      lastMaintenance: schema.lastMaintenance,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };

    return Jaeger.reconstitute(props);
  }

  static toPersistence(jaeger: Jaeger): JaegerSchema {
    const schema = new JaegerSchema();
    if (jaeger.id) schema.id = jaeger.id;
    schema.name = jaeger.name;
    schema.mark = jaeger.mark.value;
    schema.status = jaeger.status;
    schema.integrityLevel = jaeger.integrityLevel.value;
    schema.height = jaeger.height;
    schema.weight = jaeger.weight;
    schema.powerCore = jaeger.powerCore;
    schema.weapons = jaeger.weapons;
    schema.baseLocation = jaeger.baseLocation;
    schema.deploymentCount = jaeger.deploymentCount;
    schema.killCount = jaeger.killCount;
    schema.lastMaintenance = jaeger.lastMaintenance;
    return schema;
  }

  static pilotToDomain(schema: PilotSchema): Pilot {
    const props: PilotProps = {
      id: schema.id,
      name: schema.name,
      rank: schema.rank as PilotRank,
      status: schema.status as PilotStatus,
      driftCompatibility: schema.driftCompatibility,
      combatHours: schema.combatHours,
      killCount: schema.killCount,
      nationality: schema.nationality,
      jaegerId: schema.jaegerId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };

    return Pilot.reconstitute(props);
  }
}
