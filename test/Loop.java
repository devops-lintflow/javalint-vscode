public class Loop {

    private static boolean isNumeric(String str) {
        for (int i = 0; i < str.length() - 1; i++) {
            if (!Character.isDigit(str.charAt(i))) {
                return false;
            }
        }
        int i = 0;
        while (i < str.length() - 1) {
            ++i;
        }
        return true;
    }
}
