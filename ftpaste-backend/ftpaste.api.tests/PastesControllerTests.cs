using FTPaste.Controllers;
using FTPaste.Models;
using FTPaste.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Microsoft.Extensions.Configuration;

namespace FTPaste.Api.Tests
{
    public class PastesControllerTests
    {
        private readonly Mock<IPasteRepository> _mockRepo;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly PastesController _controller;

        public PastesControllerTests()
        {
            _mockRepo = new Mock<IPasteRepository>();
            _mockConfig = CreateMockConfiguration();
            _controller = new PastesController(_mockRepo.Object, _mockConfig.Object);
        }

        private Mock<IConfiguration> CreateMockConfiguration()
        {
            var mockConfigSection = new Mock<IConfigurationSection>();
            mockConfigSection.Setup(x => x.Value).Returns("1");

            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(x => x.GetSection("PasteSettings:MaxExpirationHours")).Returns(mockConfigSection.Object);

            return mockConfig;
        }

        [Fact]
        public async Task CreatePaste_ReturnsBadRequest_WhenContentIsEmpty()
        {
            // Arrange
            var paste = new Paste { Content = "" };

            // Act
            var result = await _controller.CreatePaste(paste);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreatePaste_ReturnsOkResult_WithPasteIdAndDeleteToken()
        {
            // Arrange
            var paste = new Paste { Content = "Test content" };

            // Act
            var result = await _controller.CreatePaste(paste) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var response = result?.Value as CreatePasteResponse;
            Assert.NotNull(response);
            Assert.NotEqual(Guid.Empty, response?.PasteId);
            Assert.NotNull(response?.DeleteToken);
        }

        [Fact]
        public async Task GetPaste_ReturnsOkResult_WithPaste()
        {
            // Arrange
            var pasteId = Guid.NewGuid();
            var paste = new Paste { Id = pasteId, Content = "Test content" };
            _mockRepo.Setup(repo => repo.GetPasteAsync(pasteId)).ReturnsAsync(paste);

            // Act
            var result = await _controller.GetPaste(pasteId) as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            var response = result?.Value as GetPasteResponse;
            Assert.NotNull(response);
            Assert.Equal(pasteId, response?.Id);
            Assert.Equal("Test content", response?.Content);
        }

        [Fact]
        public async Task GetPaste_ReturnsNotFound_WhenPasteDoesNotExist()
        {
            // Arrange
            var pasteId = Guid.NewGuid();
            _mockRepo.Setup(repo => repo.GetPasteAsync(pasteId)).ReturnsAsync((Paste?)null);

            // Act
            var result = await _controller.GetPaste(pasteId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeletePaste_ReturnsNoContent_WhenDeleteTokenIsValid()
        {
            // Arrange
            var pasteId = Guid.NewGuid();
            var deleteToken = "valid-token";
            var paste = new Paste { Id = pasteId, DeleteToken = deleteToken };
            _mockRepo.Setup(repo => repo.GetPasteAsync(pasteId)).ReturnsAsync(paste);

            // Act
            var result = await _controller.DeletePaste(pasteId, deleteToken);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeletePaste_ReturnsUnauthorized_WhenDeleteTokenIsInvalid()
        {
            // Arrange
            var pasteId = Guid.NewGuid();
            var deleteToken = "invalid-token";
            var paste = new Paste { Id = pasteId, DeleteToken = "valid-token" };
            _mockRepo.Setup(repo => repo.GetPasteAsync(pasteId)).ReturnsAsync(paste);

            // Act
            var result = await _controller.DeletePaste(pasteId, deleteToken);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetRawPasteContent_ReturnsPlainTextContent()
        {
            // Arrange
            var pasteId = Guid.NewGuid();
            var paste = new Paste { Id = pasteId, Content = "Test content" };
            _mockRepo.Setup(repo => repo.GetPasteAsync(pasteId)).ReturnsAsync(paste);

            // Act
            var result = await _controller.GetRawPasteContent(pasteId) as ContentResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("text/plain", result?.ContentType);
            Assert.Equal("Test content", result?.Content);
        }
    }
}