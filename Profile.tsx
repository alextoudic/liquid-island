import {
  Blur,
  Canvas,
  Circle,
  ColorMatrix,
  Group,
  ImageShader,
  Paint,
  RoundedRect,
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
const ISLAND_WIDTH = 120;
const SCALE_DISTANCE = 30;
const SCALE_MIN = 0.3;
const BOUNCE_SAFE_AREA = 500;

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  if (value > max) return max;

  if (value < min) return min;

  return value;
};

const lerp = (value: number, min: number, max: number) => {
  "worklet";
  return min + (max - min) * value;
};

const Profile = () => {
  const insets = useSafeAreaInsets();
  const avatarTop = insets.top + AVATAR_MARGIN;
  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  const image = useImage(require("./assets/avatar.jpg"));

  const transformProgress = useDerivedValue(
    () => clamp(offsetY.value / SCALE_DISTANCE, 0, 1),
    []
  );
  const blur = useDerivedValue(() => lerp(transformProgress.value, 0, 12), []);
  const scale = useDerivedValue(
    () => lerp(transformProgress.value, 1, SCALE_MIN),
    []
  );
  const opacity = useDerivedValue(
    () => lerp(transformProgress.value, 1, 0),
    []
  );
  const imageSize = useDerivedValue(() => scale.value * IMAGE_SIZE, []);
  const halfImageSize = useDerivedValue(() => imageSize.value / 2, []);
  const imageX = useDerivedValue(() => width / 2 - halfImageSize.value, []);
  const imageY = useDerivedValue(() => avatarTop - offsetY.value, []);
  const cx = width / 2;
  const cy = useDerivedValue(() => imageY.value + halfImageSize.value, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(IMAGE_SIZE - imageSize.value) }],
  }));

  const layer = useMemo(
    () => (
      <Paint>
        <Blur blur={blur} />
        <ColorMatrix
          matrix={[
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
            20,
            -7, // alpha
          ]}
        />
      </Paint>
    ),
    []
  );

  const canvasContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <Animated.View style={[styles.canvas, canvasContainerStyle]}>
          <Canvas
            style={[
              {
                height: avatarTop + IMAGE_SIZE + BOUNCE_SAFE_AREA,
              },
            ]}
          >
            <Group layer={layer}>
              <RoundedRect
                r={30}
                x={width / 2 - ISLAND_WIDTH / 2}
                y={ISLAND_TOP}
                width={ISLAND_WIDTH}
                height={ISLAND_HEIGHT}
                color="black"
              />
              <Circle cx={cx} cy={cy} r={halfImageSize} color="black" />
            </Group>
            <Circle cx={cx} cy={cy} r={halfImageSize} opacity={opacity}>
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
        </Animated.View>
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
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
            eget quam. Ut nec bibendum tortor, at porta justo.
          </Text>
        </Animated.View>
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
    zIndex: 2,
  },
  content: {
    marginTop: 16 - BOUNCE_SAFE_AREA,
    alignItems: "center",
    paddingHorizontal: 32,
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
