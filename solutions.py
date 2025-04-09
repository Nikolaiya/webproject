SOLUTIONS = {
    "pygame1_task_1": {
        "title": "Крест",
        "code": """import pygame
import sys

def main():
    try:
        width, height = map(int, input().split())
    except:
        print("Неправильный формат ввода")
        return

    pygame.init()
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption("Крест")

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        screen.fill((0, 0, 0))
        pygame.draw.line(screen, (255, 255, 255), (0, 0), (width, height), 5)
        pygame.draw.line(screen, (255, 255, 255), (width, 0), (0, height), 5)
        pygame.display.flip()

if __name__ == "__main__":
    main()"""
    },
    # Другие решения можно добавить здесь
}