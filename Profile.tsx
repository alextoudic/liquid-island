import {
  Blur,
  Canvas,
  Circle,
  ColorMatrix,
  Group,
  ImageShader,
  Paint,
  Rect,
  useImage,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IMAGE_SIZE = 164;

const { width } = Dimensions.get("window");

const AVATAR_MARGIN = 16;
const ISLAND_HEIGHT = 35;
const ISLAND_TOP = 30 - ISLAND_HEIGHT / 2;
const ISLAND_WIDTH = 100;
const SCALE_DISTANCE = 30;
const SCALE_MIN = 0.3;

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.max(min, Math.min(max, value));
};

const lerp = (value: number, min: number, max: number) => {
  "worklet";
  return min + (max - min) * value;
};

const Profile = () => {
  const insets = useSafeAreaInsets();
  const avatarTop = insets.top + AVATAR_MARGIN;
  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      offsetY.value = event.contentOffset.y;
    },
  });

  const image = useImage(require("./assets/avatar.jpg"));

  const progress = useDerivedValue(() =>
    clamp(offsetY.value / SCALE_DISTANCE, 0, 1)
  );

  const scale = useDerivedValue(() => lerp(progress.value, 1, SCALE_MIN));

  const r = useDerivedValue(() => (IMAGE_SIZE / 2) * scale.value);

  const cy = useDerivedValue(() => avatarTop + r.value - offsetY.value);
  const imageSize = useDerivedValue(() => scale.value * IMAGE_SIZE);
  const imageX = useDerivedValue(() => width / 2 - imageSize.value / 2);
  const imageY = useDerivedValue(() => cy.value - imageSize.value / 2);
  const opacity = useDerivedValue(() => 1 - progress.value);

  // avoid applying effect before scroll
  const blur = useDerivedValue(() => (progress.value === 0 ? 0 : 12));
  const matrix = useDerivedValue(() => [
    1,
    0,
    0,
    0,
    0, // red
    0,
    1,
    0,
    0,
    0, // green
    0,
    0,
    1,
    0,
    0, // blue
    0,
    0,
    0,
    progress.value === 0 ? 1 : 12,
    progress.value === 0 ? 0 : -5.5, // alpha
  ]);

  const avatarPlaceHolder = useAnimatedStyle(() => ({
    height: imageSize.value,
    width: imageSize.value,
  }));

  const layer = useMemo(
    () => (
      <Paint>
        <Blur blur={blur} />
        <ColorMatrix matrix={matrix} />
      </Paint>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Canvas style={styles.canvas}>
          <Group layer={layer}>
            <Rect
              x={width / 2 - ISLAND_WIDTH / 2}
              y={ISLAND_TOP}
              width={ISLAND_WIDTH}
              height={ISLAND_HEIGHT}
              color="black"
            />
            <Circle cx={width / 2} cy={cy} r={r} color="black" />
          </Group>
          <Circle opacity={opacity} cx={width / 2} cy={cy} r={r}>
            <ImageShader
              image={image}
              fit="fill"
              x={imageX}
              y={imageY}
              width={imageSize}
              height={imageSize}
            />
          </Circle>
        </Canvas>
      </View>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        contentContainerStyle={{
          paddingTop: avatarTop,
          paddingBottom: insets.bottom,
        }}
      >
        <Animated.View style={avatarPlaceHolder} />
        <View style={styles.content}>
          <Text style={styles.legend}>John Doe - Creative Developer</Text>
          <Text style={styles.textContent}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam at
            suscipit eros, blandit venenatis sapien. Integer consectetur eros
            porta odio blandit tristique. Nunc id consectetur ipsum, placerat
            rhoncus ex. Sed ultricies urna metus. Nullam eget bibendum velit,
            mattis porta elit. Integer vehicula diam ac porta viverra. Sed
            ullamcorper, augue ut fringilla mattis, lacus diam iaculis turpis,
            in accumsan dolor nisi et libero. Proin mattis eget sapien at
            rutrum. Quisque tempor eleifend metus, quis faucibus nisl maximus
            nec. Donec luctus, nunc quis finibus iaculis, lorem sapien viverra
            mauris, vel rutrum ex diam vitae nisi. Morbi convallis dapibus
            fringilla. Fusce pulvinar velit at euismod ullamcorper. Pellentesque
            iaculis magna libero, et scelerisque lectus dapibus fermentum.
            Maecenas ornare aliquet nunc, in pulvinar massa placerat non. Sed
            cursus tellus non aliquam mattis. Maecenas gravida sem elit, sit
            amet vestibulum arcu viverra ac. Pellentesque a ornare urna. Proin a
            posuere risus. Aenean commodo sem ut magna imperdiet, vitae rutrum
            ex imperdiet. In ultrices quis velit quis convallis. Nunc a massa
            eros. Maecenas aliquet, nisl in aliquam pretium, sem lacus accumsan
            dolor, sit amet fringilla orci tortor a tortor. Curabitur mattis
            semper massa, sed pellentesque velit euismod in. Nullam ultricies a
            sapien nec mattis. Nullam ac iaculis tortor. Donec ultricies ac dui
            sit amet tincidunt. Nullam cursus, mi id fermentum ornare, justo dui
            consectetur lorem, vitae fermentum diam turpis vitae dolor. Donec
            hendrerit metus at congue mollis. Pellentesque vehicula, sapien vel
            tincidunt mollis, lacus risus finibus libero, sed semper leo nisl
            eget quam. Ut nec bibendum tortor, at porta justo. Sed efficitur,
            nunc sed congue pretium, purus nibh finibus est, ut viverra magna
            eros ac ante. Quisque lacinia blandit gravida. Fusce rhoncus ligula
            urna, non malesuada arcu suscipit nec. Sed pretium, justo ut
            vehicula tristique, ipsum velit posuere orci, at elementum orci
            risus nec enim. Morbi et suscipit nisi. Vivamus rutrum nunc
            consequat mollis gravida. Nulla lacinia nisi orci, ac volutpat metus
            luctus vitae. Cras facilisis quis lorem vel imperdiet. Aliquam quam
            massa, porttitor eget tortor quis, feugiat pretium odio. Suspendisse
            elit odio, pretium in fringilla interdum, convallis ac nibh. Etiam
            sodales urna non neque lacinia accumsan. Suspendisse sed lorem
            consectetur, tempus turpis sit amet, faucibus odio. Aenean bibendum,
            nibh eget sollicitudin condimentum, nisl dolor dictum risus, at
            ultricies libero neque eu dolor. Nulla vel condimentum massa.
            Quisque rhoncus nibh vitae turpis efficitur tristique. Mauris ut leo
            velit. Curabitur varius, magna sit amet luctus blandit, augue ex
            tempor lacus, quis aliquet felis lorem in risus. Duis imperdiet
            iaculis maximus. Quisque dictum maximus malesuada. Praesent luctus
            neque at tortor tristique bibendum. Mauris scelerisque turpis a quam
            iaculis, non elementum eros dictum. Proin non vulputate mauris,
            commodo molestie lectus. Donec ac posuere enim, eu vehicula felis.
            Nulla placerat auctor venenatis. Quisque lectus ante, interdum ut
            ante at, fringilla porta leo. Fusce dignissim lectus ut rutrum
            euismod. Maecenas nunc nisl, condimentum a iaculis in, varius quis
            lacus. Etiam at placerat metus, at semper tortor.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    width: "100%",
    height: "50%",
    zIndex: 2,
  },
  content: {
    marginTop: 16,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  avatarContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    height: "100%",
  },
  legend: {
    fontSize: 14,
    color: "#a0a0a0",
  },
  textContent: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
  },
});

export default Profile;
