import * as THREE from 'three';
import type { QualitySettings } from '../core/settings';
import { JOURNEY_WAYPOINTS } from '../camera/path';
import { Terrain } from './Terrain';
import { Sky } from './Sky';
import { Lighting } from './Lighting';
import { Atmosphere } from './Atmosphere';
import { Particles } from './Particles';
import { Warriors, type WarriorCluster } from './Warriors';
import { Props, type PropCluster } from './Props';
import { createWorldLabel } from './labels/WorldLabel';
import { REGIONS, resolveRegionBlend } from './regions';
import { createRider } from './Cavalry';
import { createWaystone } from './Waystones';
import { Companions, type CompanionDef } from './Companions';
import { Ambient } from './Ambient';
import type { Section } from '../content/types';

const REGION_WAYPOINT_INDEX: Record<string, number> = {
  approach: 0,
  about: 1,
  north: 3,
  war: 5,
  education: 7,
  archive: 8,
  parley: 10,
};

export class World {
  readonly scene = new THREE.Scene();
  readonly terrain: Terrain;
  readonly sky: Sky;
  readonly lighting: Lighting;
  readonly atmosphere: Atmosphere;
  readonly particles: Particles;
  readonly warriors: Warriors;
  readonly props: Props;
  readonly ambient: Ambient;

  constructor(settings: QualitySettings, sections: Section[]) {
    this.terrain = new Terrain(1337, settings.terrainSegments);
    this.scene.add(this.terrain.mesh);

    this.sky = new Sky();
    this.scene.add(this.sky.mesh);

    this.lighting = new Lighting(settings.shadowsEnabled, settings.shadowMapSize);
    this.scene.add(this.lighting.group);

    this.atmosphere = new Atmosphere(REGIONS[0].fogColor, REGIONS[0].fogDensity);
    this.scene.fog = this.atmosphere.fog;

    this.particles = new Particles(settings.particleCount);
    this.scene.add(this.particles.points);

    this.warriors = new Warriors(500);
    this.scene.add(this.warriors.instancedMesh, this.warriors.hero);

    this.props = new Props(160, 90, 30, 400);
    this.scene.add(this.props.group);

    const warWaypoint = JOURNEY_WAYPOINTS[5];
    this.ambient = new Ambient(
      { x: warWaypoint.x, z: warWaypoint.z, y: this.terrain.heightAt(warWaypoint.x, warWaypoint.z) },
      settings.warriorsPerCluster > 20 ? 7 : 3,
    );
    this.scene.add(this.ambient.group);

    this.populateWarriors(settings);
    this.populateProps();
    this.placeHeroWarrior();
    this.placeCavalry();
    this.placeWaystones();
    this.placeCompanions();
    this.buildWorldLabels(sections);
  }

  private populateWarriors(settings: QualitySettings): void {
    const base = settings.warriorsPerCluster;
    const wp = JOURNEY_WAYPOINTS;
    const clusters: WarriorCluster[] = [
      { center: { x: wp[0].x + 42, z: wp[0].z }, radius: 16, count: Math.round(base * 0.15) },
      { center: { x: wp[0].x - 42, z: wp[0].z }, radius: 16, count: Math.round(base * 0.15) },
      { center: { x: wp[3].x + 38, z: wp[3].z }, radius: 24, count: base },
      { center: { x: wp[3].x - 38, z: wp[3].z }, radius: 24, count: base },
      { center: { x: wp[4].x + 34, z: wp[4].z }, radius: 20, count: Math.round(base * 0.6) },
      { center: { x: wp[5].x + 34, z: wp[5].z }, radius: 22, count: Math.round(base * 0.85) },
      { center: { x: wp[5].x - 34, z: wp[5].z }, radius: 22, count: Math.round(base * 0.85) },
      { center: { x: wp[7].x + 46, z: wp[7].z }, radius: 20, count: Math.round(base * 0.3) },
      { center: { x: wp[8].x - 40, z: wp[8].z }, radius: 18, count: Math.round(base * 0.2) },
    ];
    this.warriors.populate(clusters, (x, z) => this.terrain.heightAt(x, z), 42, 1);
  }

  private populateProps(): void {
    const wp = JOURNEY_WAYPOINTS;
    const clusters: PropCluster[] = [
      { center: { x: wp[0].x, z: wp[0].z }, radius: 55, rocks: 8, trees: 3, banners: 0, grass: 30 },
      { center: { x: wp[1].x, z: wp[1].z }, radius: 55, rocks: 6, trees: 4, banners: 0, grass: 26 },
      { center: { x: wp[2].x, z: wp[2].z }, radius: 55, rocks: 10, trees: 4, banners: 0, grass: 24 },
      { center: { x: wp[3].x, z: wp[3].z }, radius: 55, rocks: 14, trees: 8, banners: 3, grass: 34 },
      { center: { x: wp[4].x, z: wp[4].z }, radius: 55, rocks: 12, trees: 10, banners: 2, grass: 28 },
      { center: { x: wp[5].x, z: wp[5].z }, radius: 55, rocks: 16, trees: 14, banners: 6, grass: 20 },
      { center: { x: wp[6].x, z: wp[6].z }, radius: 55, rocks: 12, trees: 10, banners: 3, grass: 24 },
      { center: { x: wp[7].x, z: wp[7].z }, radius: 55, rocks: 10, trees: 5, banners: 3, grass: 40 },
      { center: { x: wp[8].x, z: wp[8].z }, radius: 50, rocks: 14, trees: 6, banners: 2, grass: 22 },
      { center: { x: wp[9].x, z: wp[9].z }, radius: 50, rocks: 10, trees: 4, banners: 2, grass: 26 },
      { center: { x: wp[10].x, z: wp[10].z }, radius: 45, rocks: 8, trees: 2, banners: 4, grass: 30 },
    ];
    this.props.populate(clusters, (x, z) => this.terrain.heightAt(x, z), 99);
  }

  private placeHeroWarrior(): void {
    const summit = JOURNEY_WAYPOINTS[JOURNEY_WAYPOINTS.length - 1];
    this.warriors.placeHero(summit.x - 6, summit.z + 4, (x, z) => this.terrain.heightAt(x, z), Math.PI * 0.15);
  }

  /** Idea #3: a galloping messenger near the War chapter, and a mounted rider alongside the summit hero. */
  private placeCavalry(): void {
    const heightAt = (x: number, z: number) => this.terrain.heightAt(x, z);
    const wp = JOURNEY_WAYPOINTS;

    const messenger = createRider();
    const messengerWp = wp[6];
    messenger.position.set(messengerWp.x + 16, heightAt(messengerWp.x + 16, messengerWp.z + 6), messengerWp.z + 6);
    messenger.rotation.y = Math.PI * 0.6;
    this.scene.add(messenger);

    const summit = wp[wp.length - 1];
    const summitRider = createRider();
    summitRider.position.set(summit.x + 7, heightAt(summit.x + 7, summit.z - 3), summit.z - 3);
    summitRider.rotation.y = -Math.PI * 0.25;
    this.scene.add(summitRider);
  }

  /** Idea #9: physical waystones on the plateau. Count is fixed and decoupled from resume.education.length
   * on purpose (content and scene stay independent) — 3 reads fine whether you list 2 or 3 entries. */
  private placeWaystones(): void {
    const heightAt = (x: number, z: number) => this.terrain.heightAt(x, z);
    const wp = JOURNEY_WAYPOINTS[7];
    const offsets = [-14, 0, 14];
    for (const dx of offsets) {
      const stone = createWaystone();
      const x = wp.x + dx;
      const z = wp.z - Math.abs(dx) * 0.4;
      stone.position.set(x, heightAt(x, z), z);
      stone.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(stone);
    }
  }

  /** Idea #2: named companions with a one-line voice tied to the chapter they stand near. */
  private placeCompanions(): void {
    const heightAt = (x: number, z: number) => this.terrain.heightAt(x, z);
    const wp = JOURNEY_WAYPOINTS;
    const defs: CompanionDef[] = [
      {
        name: 'Rin, the Scout',
        line: 'Every road looks the same until you’ve walked it twice.',
        x: wp[1].x + 9,
        z: wp[1].z - 4,
        facing: Math.PI * 0.4,
      },
      {
        name: 'Captain Voss',
        line: 'I’ve buried better men for worse reasons. This one earned his rank.',
        x: wp[3].x - 22,
        z: wp[3].z + 6,
        facing: -Math.PI * 0.3,
      },
      {
        name: 'Maer, the Loremaster',
        line: 'Trials are not passed. They are survived, and remembered.',
        x: wp[7].x - 26,
        z: wp[7].z - 5,
        facing: Math.PI * 0.5,
      },
      {
        name: 'The Herald',
        line: 'State your business, traveler. The table is set.',
        x: wp[10].x + 9,
        z: wp[10].z + 3,
        facing: -Math.PI * 0.4,
      },
    ];
    const companions = new Companions(defs, this.warriors, heightAt);
    this.scene.add(companions.group);
  }

  private buildWorldLabels(sections: Section[]): void {
    for (const section of sections) {
      const waypointIndex = REGION_WAYPOINT_INDEX[section.region];
      if (waypointIndex === undefined) continue;
      const wp = JOURNEY_WAYPOINTS[waypointIndex];
      const labelX = wp.x + 58;
      const label = createWorldLabel(section.labelText);
      label.position.set(labelX, this.terrain.heightAt(labelX, wp.z) + 20, wp.z);
      this.scene.add(label);
    }
  }

  update(progress: number, elapsed: number, cameraPosition: THREE.Vector3) {
    const blend = resolveRegionBlend(progress);
    this.atmosphere.setColor(blend.fogColor);
    this.atmosphere.setDensity(blend.fogDensity);
    this.sky.setColors({ zenith: blend.skyZenith, horizon: blend.skyHorizon });
    this.particles.setTint(blend.particleColor, blend.particleFallSpeed);
    this.particles.update(elapsed, cameraPosition);
    this.lighting.followCamera(cameraPosition);
    this.props.update(elapsed);
    this.ambient.update(elapsed);
    return blend;
  }
}
