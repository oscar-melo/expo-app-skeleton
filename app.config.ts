import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
    const APP_NAME = "Skeleton App";
    const APP_SLUG = "skeleton-app";
    const PACKAGE_NAME = "com.skeletonapp";
    const SCHEME = "skeletonapp";

    return {
        ...config,
        name: APP_NAME,
        slug: APP_SLUG,
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        scheme: [SCHEME, PACKAGE_NAME],
        ios: {
            supportsTablet: true,
            bundleIdentifier: PACKAGE_NAME,
        },
        android: {
            adaptiveIcon: {
                backgroundColor: "#ffffff",
                foregroundImage: "./assets/adaptive-icon.png",
            },
            package: PACKAGE_NAME,
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        plugins: [
            "expo-router",
            "expo-asset",
        ],
        extra: {
            router: {},
            eas: {
                projectId: "22b4c9ce-750e-420a-872e-8277f1513291",
            },
        },
    };
};
