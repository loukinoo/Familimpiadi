import java.util.List;
import java.util.Scanner;

public class Estrazione {

    public static void main(String[] args) {

        Scanner tastiera = new Scanner(System.in);
        List<String> persone = new java.util.ArrayList<String>(
            java.util.Arrays.asList("Eloise", "Alessio", "Luca", "Susy", "Sabrina", "Malaika", "Naima", "Simona", "Corrado", "Kevin", "Alice", "Tristan")
        );
        int i=1;
        while (!persone.isEmpty()) {
            tastiera.nextLine();
            int ris1 = (int)(Math.random()*persone.size());
            String persona1 = persone.get(ris1);
            persone.remove(ris1);
            int ris2 = (int)(Math.random()*persone.size());
            String persona2 = persone.get(ris2);
            persone.remove(ris2);
            System.out.println("La coppia "+i+" è formata da "+persona1+" e "+persona2);
        }
        tastiera.close();
    }
}