import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController (Unit Tests)', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = controller.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should call AppService.getHello', () => {
      const getHelloSpy = jest.spyOn(service, 'getHello');

      controller.getHello();

      expect(getHelloSpy).toHaveBeenCalled();
      expect(getHelloSpy).toHaveBeenCalledTimes(1);
    });

    it('should return the same result on multiple calls', () => {
      const result1 = controller.getHello();
      const result2 = controller.getHello();
      const result3 = controller.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
