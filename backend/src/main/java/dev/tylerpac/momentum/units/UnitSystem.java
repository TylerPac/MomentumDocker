package dev.tylerpac.momentum.units;

import java.util.Locale;

public final class UnitSystem {

    public static final String METRIC = "metric";
    public static final String IMPERIAL = "imperial";

    private static final float KILOMETERS_PER_MILE = 1.609344f;
    private static final float KILOGRAMS_PER_POUND = 0.45359237f;

    private UnitSystem() {}

    public static String normalize(String unitSystem) {
        if (unitSystem == null) {
            return "";
        }
        return unitSystem.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isSupported(String unitSystem) {
        String normalized = normalize(unitSystem);
        return METRIC.equals(normalized) || IMPERIAL.equals(normalized);
    }

    public static boolean usesImperial(String unitSystem) {
        return IMPERIAL.equals(normalize(unitSystem));
    }

    public static Float distanceToCanonical(Float distance, String unitSystem) {
        if (distance == null) {
            return null;
        }
        return usesImperial(unitSystem) ? distance * KILOMETERS_PER_MILE : distance;
    }

    public static Float distanceFromCanonical(Float distance, String unitSystem) {
        if (distance == null) {
            return null;
        }
        return usesImperial(unitSystem) ? distance / KILOMETERS_PER_MILE : distance;
    }

    public static Float weightToCanonical(Float weight, String unitSystem) {
        if (weight == null) {
            return null;
        }
        return usesImperial(unitSystem) ? weight * KILOGRAMS_PER_POUND : weight;
    }

    public static Float weightFromCanonical(Float weight, String unitSystem) {
        if (weight == null) {
            return null;
        }
        return usesImperial(unitSystem) ? weight / KILOGRAMS_PER_POUND : weight;
    }
}