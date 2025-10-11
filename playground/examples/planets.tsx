import { ComponentPreview } from "@/components/component-preview";
import { Earth } from "@plexusui/components/earth";
import { Mars } from "@plexusui/components/mars";
import { Mercury } from "@plexusui/components/mercury";
import { Venus } from "@plexusui/components/venus";
import { Moon } from "@plexusui/components/moon";
import { Jupiter } from "@plexusui/components/jupiter";
import { Saturn } from "@plexusui/components/saturn";
import { Uranus } from "@plexusui/components/uranus";
import { Neptune } from "@plexusui/components/neptune";

export const EarthExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Simple"
        description="Clean Earth view without atmospheric effects or clouds. Perfect for geographic focus and data overlay applications."
        preview={
          <div className="w-full h-[600px]">
            <Earth
              dayMapUrl="/day.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Earth.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Earth.Controls
                  minDistance={12}
                  maxDistance={100}
                  enableRotate={true}
                />
                <Earth.Globe />
              </Earth.Canvas>
            </Earth>
          </div>
        }
        code={`<Earth
  dayMapUrl="/day.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Earth.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Earth.Controls minDistance={12} maxDistance={100} />
    <Earth.Globe />
  </Earth.Canvas>
</Earth>`}
      />
    </div>
  );
};

export const MarsExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Mars"
        description="The Red Planet with accurate surface textures showing Olympus Mons, Valles Marineris, and polar ice caps."
        preview={
          <div className="w-full h-[600px]">
            <Mars
              textureUrl="/flat-mars.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Mars.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Mars.Controls minDistance={12} maxDistance={100} />
                <Mars.Globe />
              </Mars.Canvas>
            </Mars>
          </div>
        }
        code={`<Mars
  textureUrl="/flat-mars.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Mars.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Mars.Controls minDistance={12} maxDistance={100} />
    <Mars.Globe />
  </Mars.Canvas>
</Mars>`}
      />
    </div>
  );
};

export const MercuryExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Mercury"
        description="The smallest terrestrial planet with detailed cratered surface mapping from MESSENGER mission data."
        preview={
          <div className="w-full h-[600px]">
            <Mercury
              textureUrl="/flat-mercury.png"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Mercury.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Mercury.Controls minDistance={12} maxDistance={100} />
                <Mercury.Globe />
              </Mercury.Canvas>
            </Mercury>
          </div>
        }
        code={`<Mercury
  textureUrl="/flat-mercury.png"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Mercury.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Mercury.Controls minDistance={12} maxDistance={100} />
    <Mercury.Globe />
  </Mercury.Canvas>
</Mercury>`}
      />
    </div>
  );
};

export const VenusExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Venus"
        description="The cloud-shrouded planet showing the thick atmospheric patterns observed by orbital missions."
        preview={
          <div className="w-full h-[600px]">
            <Venus
              textureUrl="/flat-venus.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Venus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Venus.Controls minDistance={12} maxDistance={100} />
                <Venus.Globe />
              </Venus.Canvas>
            </Venus>
          </div>
        }
        code={`<Venus
  textureUrl="/flat-venus.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Venus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Venus.Controls minDistance={12} maxDistance={100} />
    <Venus.Globe />
  </Venus.Canvas>
</Venus>`}
      />
    </div>
  );
};

export const MoonExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Moon"
        description="Earth's Moon with detailed surface features including maria, highlands, and major craters."
        preview={
          <div className="w-full h-[600px]">
            <Moon
              textureUrl="/moon.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Moon.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Moon.Controls minDistance={12} maxDistance={100} />
                <Moon.Globe />
              </Moon.Canvas>
            </Moon>
          </div>
        }
        code={`<Moon
  textureUrl="/moon.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Moon.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Moon.Controls minDistance={12} maxDistance={100} />
    <Moon.Globe />
  </Moon.Canvas>
</Moon>`}
      />
    </div>
  );
};

export const JupiterExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Jupiter"
        description="The gas giant featuring the Great Red Spot and complex band structures in its atmosphere."
        preview={
          <div className="w-full h-[600px]">
            <Jupiter
              textureUrl="/flat-jupiter.jpg"
              enableRotation={false}
              brightness={1.1}
              radius={10}
            >
              <Jupiter.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Jupiter.Controls minDistance={12} maxDistance={100} />
                <Jupiter.Globe />
              </Jupiter.Canvas>
            </Jupiter>
          </div>
        }
        code={`<Jupiter
  textureUrl="/flat-jupiter.jpg"
  enableRotation={false}
  brightness={1.1}
  radius={10}
>
  <Jupiter.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Jupiter.Controls minDistance={12} maxDistance={100} />
    <Jupiter.Globe />
  </Jupiter.Canvas>
</Jupiter>`}
      />
    </div>
  );
};

export const SaturnExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Saturn"
        description="The ringed planet with its distinctive atmospheric bands and hexagonal polar storm."
        preview={
          <div className="w-full h-[600px]">
            <Saturn
              textureUrl="/saturnmap.jpg"
              enableRotation={false}
              brightness={1.2}
              showRings={true}
              radius={10}
            >
              <Saturn.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Saturn.Controls minDistance={12} maxDistance={100} />
                <Saturn.Globe />
                <Saturn.Rings />
              </Saturn.Canvas>
            </Saturn>
          </div>
        }
        code={`<Saturn
  textureUrl="/saturnmap.jpg"
  enableRotation={false}
  brightness={1.2}
  showRings={true}
  radius={10}
>
  <Saturn.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Saturn.Controls minDistance={12} maxDistance={100} />
    <Saturn.Globe />
    <Saturn.Rings />
  </Saturn.Canvas>
</Saturn>`}
      />
    </div>
  );
};

export const UranusExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Uranus"
        description="The ice giant with its unique blue-green coloration from atmospheric methane."
        preview={
          <div className="w-full h-[600px]">
            <Uranus
              textureUrl="/flat-uranus.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Uranus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Uranus.Controls minDistance={12} maxDistance={100} />
                <Uranus.Globe />
              </Uranus.Canvas>
            </Uranus>
          </div>
        }
        code={`<Uranus
  textureUrl="/flat-uranus.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Uranus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Uranus.Controls minDistance={12} maxDistance={100} />
    <Uranus.Globe />
  </Uranus.Canvas>
</Uranus>`}
      />
    </div>
  );
};

export const NeptuneExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Neptune"
        description="The distant ice giant with its deep blue atmosphere and dynamic weather systems."
        preview={
          <div className="w-full h-[600px]">
            <Neptune
              textureUrl="/flat-neptune.jpg"
              enableRotation={false}
              brightness={1.3}
              radius={10}
            >
              <Neptune.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Neptune.Controls minDistance={12} maxDistance={100} />
                <Neptune.Globe />
              </Neptune.Canvas>
            </Neptune>
          </div>
        }
        code={`<Neptune
  textureUrl="/flat-neptune.jpg"
  enableRotation={false}
  brightness={1.3}
  radius={10}
>
  <Neptune.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Neptune.Controls minDistance={12} maxDistance={100} />
    <Neptune.Globe />
  </Neptune.Canvas>
</Neptune>`}
      />
    </div>
  );
};

export { earthApiProps as EarthApiReference } from "./api/earth";
export {
  planetApiProps as MarsApiReference,
  planetApiProps as MercuryApiReference,
  planetApiProps as VenusApiReference,
  planetApiProps as MoonApiReference,
  planetApiProps as JupiterApiReference,
  planetApiProps as UranusApiReference,
  planetApiProps as NeptuneApiReference,
  saturnApiProps as SaturnApiReference,
} from "./api/planets";
