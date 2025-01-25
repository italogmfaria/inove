# INOVE

## Inovação Online para Vivências Educacionais

#### Logo do Projeto

![](src/assets/logo.png)

#### Contextualização

No cenário educacional atual, a utilização de ferramentas de ensino e metodologias inovadoras tem se mostrado cada vez mais essencial para promover uma experiência de aprendizado efetiva e engajadora. Este projeto surge da necessidade de acompanhar o avanço tecnológico e inovar no processo de ensino.

#### Objetivo do Projeto

O objetivo do projeto INOVE é desenvolver uma plataforma educacional online voltada especificamente para professores, proporcionando ferramentas inovadoras e metodologias pedagógicas mais ativas e personalizadas.

#### Resultados esperados

1. **Capacitação de Professores**  
   - Os professores participantes serão formados para utilizar ferramentas de ensino e metodologias inovadoras, ampliando suas competências pedagógicas. Como resultado, espera-se que se sintam mais preparados e motivados a adotar práticas mais criativas e eficientes em suas aulas, promovendo um ambiente de ensino mais dinâmico e atualizado.

2. **Melhoria da Experiência de Ensino e Aprendizagem**  
   - Com a aplicação das ferramentas inovadoras em sala de aula, projeta-se uma transformação na forma como alunos e professores interagem. Os alunos terão uma participação mais ativa e colaborativa, facilitando uma aprendizagem mais significativa e duradoura, ao mesmo tempo em que se promove um clima de motivação e engajamento.

3. **Avaliação da Efetividade das Metodologias**  
   - O projeto inclui uma avaliação contínua das ferramentas implementadas, visando medir sua contribuição para o processo de ensino-aprendizagem. Esta análise permitirá identificar práticas pedagógicas mais eficazes e fornecerá subsídios para a melhoria contínua da plataforma e do projeto como um todo.

4. **Democratização e Inclusão Digital**  
   - A plataforma educacional será disponibilizada gratuitamente, garantindo amplo acesso a recursos educacionais de alta qualidade. Dessa forma, espera-se promover a inclusão digital e educacional, ampliando as oportunidades de aprendizado para diferentes públicos e fortalecendo a democratização da educação.

5. **Disseminação dos Resultados**  
   - Os resultados obtidos ao longo do projeto serão compartilhados com a comunidade acadêmica e educacional, por meio de relatórios, publicações e eventos. Essa disseminação visa ampliar o impacto do projeto, incentivando outras instituições a adotarem práticas semelhantes e reforçando o compromisso com a inovação no ensino.

#### Nome dos Membros do Projeto

```bash
Diego Ribeiro Araújo
Flávio Diniz de Sousa
Italo Gonçalves Meireles Faria
João Gabriel de Oliveira Meireles
José Antonio Ribeiro Souto
Pedro Henrique Marques
```

#### Instruções de Uso do Projeto

#### Para executar o Front-end do Sistema INOVE, siga estas etapas:

1. **Configuração da API Backend:**

   - Verifique se o backend (Spring Boot) está rodando corretamente, conforme as instruções do backend.
   - Certifique-se de que a API está rodando no endereço correto (exemplo: `http://localhost:8080`), que será utilizada pelo Angular para fazer requisições.

2. **Instalar Dependências do Projeto Angular:**

   - Certifique-se de que você tem o **Node.js** e **npm** instalados em sua máquina. Para verificar, use os seguintes comandos:
     ```bash
     node -v
     npm -v
     ```

   - Após isso, vá para o diretório do projeto Angular e instale as dependências necessárias executando o comando abaixo:
     ```bash
     npm install
     ```

3. **Configuração de Variáveis de Ambiente:**

   - No diretório `src/environments`, ajuste o arquivo `environment.ts` para apontar para a URL correta da API backend. Exemplo de configuração:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: 'http://localhost:8080/api'  // URL do backend
     };
     ```

4. **Executar o Projeto Angular:**

   - Para rodar o sistema, use o seguinte comando:
     ```bash
     ng serve
     ```

   - Isso iniciará o servidor de desenvolvimento Angular. Você pode acessar o sistema no navegador usando o seguinte endereço:
     ```
     http://localhost:4200
     ```

5. **Testar Funcionalidades:**

   - Após iniciar o sistema, você poderá testar as operações de CRUD, visualização de cursos, gestão de usuários e outras funcionalidades que integram com o backend.
   - Para cada operação que o sistema faz, ele irá se comunicar com o backend através das rotas configuradas na API.

6. **Componentes Standalone (Angular v14+):**

   - Certifique-se de que cada componente standalone foi gerado corretamente, e que o roteamento está configurado de acordo com as instruções anteriores.