import java.util.ArrayList;
import java.util.List;

public class EstrazioneSfide {
    public static void main(String[] args) {

        for (int i=0; i<6; i++) {
            List<String> squadre = new ArrayList<String>(
                java.util.Arrays.asList("Kevin e Luca", "Corrado e Simona", "Naima e Susy", "Malaika e Tristan", "Sabrina ed Eloise", "Alessio e Alice", "Gabriel e Chio", "Savannah e Riccardo")
            );
            System.out.println(i+1);
            
            while (!squadre.isEmpty()) {
                int ris1 = (int)(Math.random()*squadre.size());
                String persona1 = squadre.get(ris1);
                squadre.remove(ris1);
                int ris2 = (int)(Math.random()*squadre.size());
                String persona2 = squadre.get(ris2);
                squadre.remove(ris2);
                System.out.println(persona1+" vs "+persona2);
            }
            
            System.out.println();
        }
    }
}
